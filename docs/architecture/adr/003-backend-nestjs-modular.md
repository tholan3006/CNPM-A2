# ADR 003: Lựa chọn Kiến trúc Modular NestJS cho Backend API

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Trần Vĩnh Thọ Lân & Phan Vũ Việt Quang
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Backend của hệ thống BrewLite cần xử lý nhiều luồng nghiệp vụ phức tạp: duyệt menu món, tính toán giá kèm topping/size, quản lý giỏ hàng, máy trạng thái đơn hàng (Order State Machine), xác thực người dùng JWT và cổng thanh toán mô phỏng. Cần một framework phía server có kiến trúc chặt chẽ, hỗ trợ TypeScript triệt để và dễ dàng mở rộng.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: Express.js thuần:**
  * *Ưu điểm:* Rất nhẹ, cú pháp quen thuộc, tài liệu phong phú.
  * *Nhược điểm:* Thiếu cấu trúc chuẩn mực; mỗi lập trình viên tự viết theo một kiểu cấu trúc thư mục khác nhau; việc tổ chức Dependency Injection (DI) thủ công dễ sinh ra code khó kiểm thử.
* **Phương án B: NestJS Framework:**
  * *Ưu điểm:* Cung cấp cấu trúc Module hóa rõ ràng (`@Module`, `@Controller`, `@Injectable`); tích hợp sẵn hệ thống Dependency Injection mạnh mẽ; hỗ trợ tự động sinh tài liệu Swagger OpenAPI; tích hợp sẵn `ValidationPipe` với `class-validator`.
  * *Nhược điểm:* Thời gian khởi động và cấu hình ban đầu cao hơn Express.

## 3. Quyết định (Decision)
Nhóm lựa chọn **Phương án B: NestJS Framework** cho toàn bộ backend tại thư mục `apps/api`:
* Phân chia thành các module nghiệp vụ độc lập:
  * `ProductsModule`: Xử lý menu, chi tiết món, tính tiền size & topping.
  * `OrdersModule`: Xử lý máy trạng thái đơn hàng (`order-state-machine.ts`), vòng đời đơn (`order-lifecycle.service.ts`).
  * `PaymentsModule`: Xử lý giao dịch thanh toán mô phỏng.
  * `AuthModule`: Xác thực JWT, đăng ký, đăng nhập.
  * `PrismaModule`: Quản lý kết nối cơ sở dữ liệu dùng chung.
* Sử dụng bộ lọc ngoại lệ toàn cục (`HttpExceptionFilter`) và đường ống kiểm tra dữ liệu (`ValidationPipe`).

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Codebase sạch, chuẩn mực doanh nghiệp; dễ dàng viết Unit Test (Jest) cho từng Service biệt lập bằng cách mock các dependency; Swagger UI tự động tại `/api/docs`.
* **Thách thức:** Cần quản lý cấu hình môi trường tập trung (`@nestjs/config`) để tránh rò rỉ secret.
