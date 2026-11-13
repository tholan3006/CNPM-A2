# Đặc tả Use-Case trọng tâm: Đặt và thanh toán đơn hàng (Task 1.3)

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Mã Use Case** | **UC-01: Đặt và thanh toán đơn hàng** |
| **Tên Use Case** | Đặt món và thực hiện thanh toán không tiền mặt |
| **Tác nhân (Actor)** | Khách hàng (Customer), Cổng thanh toán giả lập (Mock Payment Gateway) |
| **Mô tả tóm tắt** | Khách hàng duyệt giỏ hàng, chọn phương thức thanh toán không tiền mặt (MoMo, VNPay, Thẻ), hệ thống thực hiện trừ tiền an toàn thông qua cơ chế Idempotency và chuyển đổi trạng thái đơn sang `PAID`. |
| **Kích hoạt (Trigger)** | Khách hàng nhấn nút "Tiến hành thanh toán" trên màn hình Giỏ hàng hoặc Modal Đặt hàng. |
| **Mã yêu cầu liên kết** | **FR-05** (Thanh toán không tiền mặt), **FR-06** (Xác nhận đơn hàng), **NFR-03** (Idempotency & Security). |

---

## 1. Tiền điều kiện (Preconditions)
1. Khách hàng đã đăng nhập tài khoản hợp lệ (JWT Access Token còn hiệu lực).
2. Giỏ hàng có ít nhất 1 sản phẩm hợp lệ và còn tồn kho.
3. Bản ghi đơn hàng đã được khởi tạo tạm ở trạng thái `PENDING`.

---

## 2. Hậu điều kiện (Postconditions)
1. Trạng thái đơn hàng chuyển sang `PAID`.
2. Bản ghi giao dịch `Payment` được lưu thành công với trạng thái `SUCCESS` và mã tham chiếu `transactionRef`.
3. Giỏ hàng của khách hàng được xóa rỗng (`clearCart()`).
4. Màn hình xác nhận đơn hàng (`/order-success`) hiển thị mã đơn định danh dạng `#ORD-XXXXXX`.

---

## 3. Luồng sự kiện chính (Happy Path)
1. Khách hàng điều hướng đến màn hình Checkout (`/checkout`), xem lại tổng tiền, danh sách món và thông tin nhận hàng.
2. Khách hàng chọn phương thức thanh toán (*Ví MoMo / Cổng VNPay / Thẻ ngân hàng Visa/ATM*), nhập số điện thoại và ghi chú nhận hàng.
3. Khách hàng bấm nút **"Thanh toán ngay"**.
4. Client sinh khóa duy nhất `idempotencyKey` (chuẩn UUIDv4) và gửi `POST /payments` kèm header `Idempotency-Key` và Bearer Token.
5. Backend xác thực JWT token thông qua `JwtAuthGuard`, kiểm tra khóa `idempotencyKey` trong bảng `payments`.
6. Khóa chưa từng xuất hiện $\rightarrow$ Backend mở transaction CSDL, insert bản ghi `Payment` với trạng thái `PENDING` để giành quyền xử lý (In-flight Lock).
7. Backend gọi Cổng thanh toán giả lập (Mock Payment Gateway) để trừ tiền.
8. Cổng thanh toán phản hồi giao dịch thành công kèm mã tham chiếu `transactionRef`.
9. Backend mở transaction CSDL:
   - Cập nhật `Order.status = PAID`.
   - Cập nhật `Payment.status = SUCCESS` và lưu `transactionRef`.
   - Cộng điểm thưởng tích lũy (Loyalty Points) cho khách hàng.
10. Backend trả về HTTP 201 Created cùng thông tin đơn hàng và mã giao dịch.
11. Client xóa giỏ hàng và điều hướng tới Màn hình Xác nhận Đơn hàng (`/order-success`).

---

## 4. Luồng thay thế (Alternative Flows)

### Alt-1: Gửi lại yêu cầu với cùng Idempotency Key (Idempotent Replay)
* Tại bước 5, Backend phát hiện khóa `idempotencyKey` đã tồn tại trong CSDL.
* Backend kiểm tra tính khớp nối với đơn hàng cũ và trả về ngay kết quả giao dịch trước đó (HTTP 200 OK, cờ `idempotentReplay: true`) mà **không** gọi trừ tiền lại ở Cổng thanh toán.

---

## 5. Luồng ngoại lệ (Exception Flows)

### Exc-1: Giao dịch thanh toán thất bại (Số dư không đủ / Thẻ lỗi)
* Tại bước 8, Cổng thanh toán trả về kết quả thất bại.
* Backend cập nhật đơn hàng thành `PAYMENT_FAILED`, ghi nhận giao dịch `Payment(FAILED)`.
* Backend trả về HTTP 400 Bad Request kèm lý do lỗi chi tiết.
* Client thông báo lỗi đỏ cho người dùng nhưng **giữ nguyên toàn bộ giỏ hàng**, cho phép khách đổi phương thức thanh toán và bấm "Thử lại thanh toán".

### Exc-2: Giao dịch đang được xử lý bởi luồng song song (In-flight Conflict)
* Backend phát hiện đang có một request khác cùng xử lý `orderId` với trạng thái `PENDING`.
* Backend trả về HTTP 409 Conflict yêu cầu client chờ giao dịch hoàn tất.
