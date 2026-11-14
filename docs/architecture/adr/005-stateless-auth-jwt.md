# ADR 005: Cơ chế Xác thực Phi trạng thái qua JWT và Mã hóa Bcrypt

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Nguyễn Hữu Chí Công & Trần Vĩnh Thọ Lân
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Ứng dụng BrewLite phục vụ lượng lớn khách hàng đặt đồ uống qua điện thoại và máy tính. Hệ thống yêu cầu:
1. Bảo mật thông tin người dùng và tài khoản đặt hàng.
2. Không lưu session tập trung trên server (Stateless) để dễ dàng scale ngang container trong tương lai.
3. Bảo vệ các endpoint nhạy cảm như tạo đơn hàng (`POST /orders`), thanh toán (`POST /payments`), xem lịch sử đơn hàng.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: Session-based Authentication (Cookie + Redis/MemoryStore):**
  * *Ưu điểm:* Dễ thu hồi (revoke) phiên đăng nhập ngay lập tức.
  * *Nhược điểm:* Phụ thuộc vào server lưu session, tốn thêm bộ nhớ và khó triển khai multi-container không chia sẻ bộ nhớ; vấn đề Cross-Site Request Forgery (CSRF) phức tạp trên mobile app/PWA.
* **Phương án B: Token-based Authentication (JSON Web Token - JWT Bearer):**
  * *Ưu điểm:* Hoàn toàn phi trạng thái (Stateless); server chỉ cần dùng khóa bí mật `JWT_SECRET` để giải mã và xác thực chữ ký số; hoạt động xuất sắc trên cả Web di động, PWA và API client.
  * *Nhược điểm:* Token không thể thu hồi tức thì trước khi hết hạn (cần cơ chế đặt hạn ngắn).

## 3. Quyết định (Decision)
Nhóm quyết định chọn **Phương án B: JSON Web Token (JWT) kết hợp thuật toán băm mật khẩu Bcrypt**:
* Mật khẩu người dùng được băm một chiều bằng thuật toán `bcrypt` với hệ số Salt = 10 (`bcrypt.hash(password, 10)`). Tuyệt đối không lưu mật khẩu dạng văn bản thô (Plaintext).
* Khi đăng nhập thành công, máy chủ cấp phát chuỗi JWT có hạn sử dụng (ví dụ 1 ngày), chứa payload tối giản `{ sub: user.id, phone: user.phone, role: user.role }`.
* Client lưu JWT trong `localStorage` và gửi kèm trong header `Authorization: Bearer <token>` ở mỗi yêu cầu bảo mật.
* Tầng bảo vệ phía NestJS áp dụng `JwtAuthGuard` kế thừa từ `@nestjs/passport` để chặn các request không hợp lệ.

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Tương thích tuyệt đối với kiến trúc microservice/container hóa; bảo mật đạt tiêu chí NFR-02 của đồ án; kiểm thử đơn giản bằng cách tạo mock token.
* **Thách thức:** Biến môi trường `JWT_SECRET` phải được quản lý chặt chẽ trong `.env` và bí mật của CI/CD, không được hardcode vào mã nguồn.
