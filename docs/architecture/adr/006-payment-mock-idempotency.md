# ADR 006: Mô phỏng Cổng thanh toán & Cơ chế Idempotency Chống Trùng lặp

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Phan Vũ Việt Quang & Trần Vĩnh Thọ Lân
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Trong môi trường mạng di động không ổn định (ví dụ khách đang ngồi quán cà phê mạng chập chờn):
1. Khách hàng bấm nút "Thanh toán" nhưng mạng bị lag, họ có xu hướng bấm liên tiếp nhiều lần.
2. Nếu không có cơ chế bảo vệ, hệ thống sẽ gọi cổng thanh toán nhiều lần và trừ tiền trùng lặp cho cùng một đơn hàng (Duplicate Payment).
3. Đề bài yêu cầu có cổng thanh toán mô phỏng (Mock Payment) hỗ trợ Thẻ và Ví điện tử, có phản hồi thành công và thất bại để kiểm thử các nhánh rẽ nghiệp vụ.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: Chỉ khóa nút bấm ở phía giao diện Frontend (Disable Button):**
  * *Ưu điểm:* Dễ cài đặt.
  * *Nhược điểm:* Hoàn toàn không an toàn; nếu người dùng làm mới trang, gửi lại request qua Postman hoặc mạng bị retry ngầm ở tầng HTTP client thì vẫn gây trừ tiền kép.
* **Phương án B: Áp dụng cơ chế Khóa chống trùng lặp (Idempotency Key Pattern) ở Backend:**
  * *Ưu điểm:* Mỗi phiên thanh toán của đơn hàng sinh ra 1 khóa định danh duy nhất (`Idempotency-Key`). Khi Backend nhận được yêu cầu có cùng khóa này, nó sẽ kiểm tra xem giao dịch đã xử lý chưa; nếu đã xử lý, trả về ngay kết quả trước đó mà không thực hiện trừ tiền hay tạo bản ghi thanh toán mới.
  * *Nhược điểm:* Cần lưu trữ và kiểm tra trường `idempotencyKey` trong bảng `Payment` của CSDL.

## 3. Quyết định (Decision)
Nhóm quyết định chọn **Phương án B: Idempotency Key Pattern kết hợp Cổng thanh toán mô phỏng**:
* Trường `idempotencyKey` được định nghĩa là trường `@unique` trong bảng `Payment` (`prisma/schema.prisma`).
* Dịch vụ thanh toán `PaymentProcessorService` kiểm tra:
  * Nếu tìm thấy thanh toán đã thành công (`PAID`) với cùng `idempotencyKey` hoặc cùng `orderId`, hệ thống từ chối thanh toán lặp và trả về kết quả an toàn.
  * Hỗ trợ hai phương thức thanh toán mô phỏng: `E_WALLET` (Ví điện tử MoMo/ZaloPay) và `CREDIT_CARD` (Thẻ ngân hàng quốc tế/nội địa).
  * Hỗ trợ cờ mô phỏng thất bại (Failure Simulation) để kiểm thử nhánh rẽ khôi phục giỏ hàng khi thanh toán không thành công.

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Đáp ứng xuất sắc tiêu chí NFR-03 (Tính toàn vẹn giao dịch và Idempotency); bảo vệ tối đa quyền lợi khách hàng; hỗ trợ kiểm thử tự động (Integration Test) bao phủ đầy đủ các nhánh lỗi mạng và thử lại.
* **Thách thức:** Frontend phải sinh UUID cho `idempotencyKey` ngay khi mở modal thanh toán và giữ nguyên khóa này trong suốt lượt thử thanh toán đó.
