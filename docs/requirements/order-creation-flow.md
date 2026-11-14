# Đặc tả Luồng nghiệp vụ Quản lý Giỏ hàng & Khởi tạo Đơn hàng

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Mã chức năng** | **FR-04: Quản lý Giỏ hàng & Tạo đơn hàng (US-04)** |
| **Tác nhân (Actor)** | Khách hàng (Customer), Hệ thống Quản trị Đơn hàng (BrewLite API) |
| **Phạm vi** | Quản lý state giỏ hàng phía Client (Zustand), tính toán phụ phí Size/Topping, validate DTO phía Backend, trừ tồn kho lạc quan và khởi tạo đơn hàng `PENDING` trong CSDL PostgreSQL. |
| **Mã yêu cầu liên kết** | **FR-03** (Chi tiết món & tùy chọn), **FR-04** (Giỏ hàng & Đơn hàng), **FR-05** (Thanh toán). |

---

## 1. Bối cảnh & Mục tiêu nghiệp vụ
Giỏ hàng là cầu nối trung gian giữa việc duyệt xem danh mục sản phẩm (Menu) và thực hiện giao dịch thanh toán (Checkout). Nhằm mang lại trải nghiệm mua sắm mượt mà trên thiết bị di động (Mobile-first PWA), phân hệ Giỏ hàng đảm bảo các nguyên tắc kỹ thuật sau:
1. **Quản lý trạng thái tức thì (Optimistic Client State):** Sử dụng Zustand kết hợp `localStorage` để lưu trữ giỏ hàng, giúp người dùng không bị mất danh sách món khi tải lại trang hoặc mất kết nối tạm thời.
2. **Badge thông báo số lượng theo thời gian thực:** Icon giỏ hàng trên thanh điều hướng (Navbar) luôn phản ánh chính xác tổng số lượng sản phẩm trong giỏ.
3. **Không tin cậy dữ liệu giá từ Client:** Client chỉ gửi danh sách `productId`, `size`, `qty` và `toppingIds`. Toàn bộ giá bán gốc, phụ phí Size ($S=0đ, M=5.000đ, L=10.000đ$), đơn giá Topping và chiết khấu Coupon bắt buộc phải được truy vấn và tính toán lại 100% tại Backend để chống gian lận dữ liệu.
4. **Kiểm soát tồn kho đồng thời (Concurrency Control):** Áp dụng cơ chế Khóa lạc quan (Optimistic Locking) thông qua trường `version` trong bảng `Product`, kết hợp cơ chế thử lại tự động (`MAX_RETRIES = 5`) khi có tranh chấp tài nguyên tại giờ cao điểm.

---

## 2. Tiền điều kiện (Preconditions)
1. Giỏ hàng có ít nhất một sản phẩm hợp lệ (`items.length >= 1`).
2. Khách hàng đã đăng nhập tài khoản hợp lệ (có JWT Access Token hợp lệ gửi kèm header `Authorization: Bearer <token>`).
3. Các sản phẩm và topping được chọn đang ở trạng thái kinh doanh (`isActive = true`).

---

## 3. Hậu điều kiện (Postconditions)
1. Bản ghi `Order` được tạo mới trong CSDL với trạng thái khởi tạo `PENDING` và mã định danh tự động duy nhất (`orderNumber` định dạng `#ORD-XXXXXX`).
2. Các bản ghi `OrderItem` và `OrderItemTopping` được lưu trữ toàn vẹn trong cùng một Database Transaction.
3. Số lượng tồn kho (`stock`) của các sản phẩm tương ứng được trừ đi chính xác.
4. Nếu có áp dụng mã Coupon hợp lệ, số lượt đã sử dụng (`usedCount`) của Coupon tăng thêm 1.
5. Client nhận về thông tin đơn hàng mới và chuyển tiếp sang màn hình Thanh toán (`/checkout`).

---

## 4. Chi tiết các luồng sự kiện

### 4.1. Luồng chính (Happy Path)
1. Khách hàng bấm mở Giỏ hàng (dạng Drawer bên phải hoặc trang `/cart`).
2. Khách hàng kiểm tra danh sách món, có thể tăng/giảm số lượng hoặc xóa bớt món.
3. Zustand tự động tính toán lại:
   $$\text{subtotal} = \sum (\text{basePrice} + \text{sizeOffset} + \sum \text{toppingPrice}) \times \text{qty}$$
4. Khách hàng nhập mã giảm giá (nếu có) và ghi chú pha chế.
5. Khách hàng nhấn nút **"Tiến hành đặt hàng"**.
6. Frontend kiểm tra trạng thái đăng nhập:
   * Nếu đã đăng nhập $\rightarrow$ Đóng gói payload `CreateOrderDto` và gọi `POST /orders`.
7. `ValidationPipe` của NestJS kiểm tra payload: `items` không được rỗng, số lượng mỗi món từ 1 đến 20, size thuộc `[S, M, L]`.
8. `OrdersService` mở CSDL Transaction:
   * Nạp giá sản phẩm & topping thực tế từ bảng `products` và `toppings`.
   * Kiểm tra tồn kho của từng sản phẩm: $\text{stock} \ge \text{qty}$.
   * Thực hiện trừ tồn kho theo cơ chế Khóa lạc quan:
     ```sql
     UPDATE products SET stock = stock - :qty, version = version + 1
     WHERE id = :id AND version = :currentVersion;
     ```
   * Kiểm tra và tính chiết khấu Coupon (nếu có).
   * Tạo bản ghi `Order` với trạng thái `PENDING`.
9. CSDL Commit Transaction thành công.
10. Backend trả về HTTP 201 Created cùng thông tin đơn hàng:
    ```json
    {
      "id": "c1f7b8a2-...",
      "orderNumber": "#ORD-882914",
      "status": "PENDING",
      "subtotal": 90000,
      "discountAmount": 10000,
      "total": 80000,
      "createdAt": "2026-11-14T09:00:00.000Z"
    }
    ```
11. Frontend lưu mã đơn hàng `pendingOrderId` và chuyển hướng sang màn hình Thanh toán (`/checkout`).

---

## 5. Các luồng ngoại lệ & Xử lý lỗi (Exception Flows)

### Exc-1: Khách hàng chưa đăng nhập khi bấm đặt hàng
* Hệ thống hiển thị popup đăng nhập (`AuthModal`).
* Sau khi đăng nhập thành công, token được lưu và hệ thống tự động giữ nguyên giỏ hàng để khách hàng tiếp tục bấm đặt hàng mà không phải chọn lại.

### Exc-2: Sản phẩm bị hết hàng trong lúc chờ đặt (Out of Stock)
* Nếu $\text{stock} < \text{qty}$, Backend hủy bỏ transaction và trả về lỗi:
  `HTTP 400 Bad Request: "Sản phẩm [Tên sản phẩm] chỉ còn [X] phần, không đủ số lượng yêu cầu"`.
* Frontend hiển thị thông báo lỗi màu đỏ để khách hàng điều chỉnh lại số lượng trong giỏ.

### Exc-3: Xung đột phiên bản khi nhiều người cùng đặt món cuối (Version Conflict)
* Hệ thống tự động thử lại tối đa 5 lần (`MAX_RETRIES = 5`) với khoảng delay ngẫu nhiên (jitter 20-80ms).
* Nếu sau 5 lần vẫn xung đột, Backend trả về:
  `HTTP 409 Conflict: "Hệ thống đang bận do nhiều người đặt cùng lúc, vui lòng thử lại"`.
