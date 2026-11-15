# Báo cáo Sprint Review & Retrospective - Đồ án BrewLite

Tài liệu này tổng kết quá trình phát triển, nghiệm thu kỹ thuật và đánh giá cải tiến quy trình của nhóm phát triển đồ án BrewLite qua 2 giai đoạn Sprint (Sprint 1: Xây dựng nền tảng & Menu MVP; Sprint 2: Hoàn thiện nghiệp vụ End-to-End, Kiểm thử tích hợp & CI/CD).

---

## 1. Đánh giá Kết quả Sprint 1 (Sprint 1 Review)

### 1.1. Mục tiêu và Kết quả thực hiện
Sprint 1 tập trung vào việc thiết lập hạ tầng đồ án và hoàn thiện luồng nghiệp vụ xem thực đơn đồ uống theo chuẩn Task 4.1 và Task 4.3 của đồ án:
* **Khởi tạo kiến trúc Monorepo:** Thống nhất đưa toàn bộ mã nguồn Frontend Next.js (`apps/web`), Backend NestJS (`apps/api`) và tài liệu (`docs/`) vào cùng một kho lưu trữ.
* **Giao diện Menu Next.js PWA:** Xây dựng màn hình thực đơn theo định hướng mobile-first, hỗ trợ bộ lọc danh mục động (Cà phê, Trà, Cold Brew) và tìm kiếm món tức thì, xử lý đầy đủ các trạng thái tải dữ liệu, danh sách rỗng và lỗi mạng.
* **Dịch vụ Backend API:** Xây dựng endpoint `GET /products` và `GET /products/:id`, thiết lập mô hình dữ liệu quan hệ với PostgreSQL thông qua Prisma ORM và nạp sẵn dữ liệu mẫu qua kịch bản `seed.ts`.
* **Thiết lập CI ban đầu:** Cấu hình GitHub Actions chạy kiểm thử tự động mỗi khi có Pull Request mở vào nhánh chính.

### 1.2. Đánh giá và Cải tiến kỹ thuật sau Sprint 1
* **Điểm thuận lợi:** Việc thống nhất cấu trúc thư mục ngay từ đầu giúp các thành viên dễ dàng định nghĩa kiểu dữ liệu dùng chung giữa client và server.
* **Khó khăn gặp phải:** Trong lần tích hợp CI đầu tiên (commit `df37c34`), pipeline bị dừng do thiếu cấu hình script `lint` trong `package.json` của NestJS và chưa cung cấp biến môi trường giả lập cho Prisma.
* **Giải pháp đã thực hiện:** Bổ sung cấu hình lint, cô lập phạm vi unit test độc lập với database và cấu hình biến môi trường an toàn trên GitHub Actions, giúp pipeline vượt qua toàn bộ các bước kiểm tra (commit `0e7af9e`).

---

## 2. Đánh giá Kết quả Sprint 2 (Sprint 2 Review)

### 2.1. Nghiệm thu Toàn diện Luồng Nghiệp vụ End-to-End
Sprint 2 hoàn thành toàn bộ các mảnh ghép nghiệp vụ còn lại, kết nối thành chuỗi trải nghiệm hoàn chỉnh:
* **Chi tiết món & Tùy chọn (Thành viên 2):** Hoàn thiện modal chi tiết sản phẩm, cho phép tùy biến kích cỡ (S/M/L), chọn thêm topping và tự động tính toán tổng giá món theo thời gian thực.
* **Giỏ hàng & Khởi tạo đơn hàng (Thành viên 3):** Xây dựng kho lưu trữ giỏ hàng phía client (Zustand store), quản lý tăng/giảm số lượng, lưu trữ bền vững qua `localStorage` và xử lý khởi tạo đơn hàng với mã định danh `#ORD-XXXXXX`.
* **Cổng thanh toán mô phỏng & Idempotency (Thành viên 3):** Tích hợp phương thức thanh toán thẻ và ví điện tử, áp dụng cơ chế khóa chống trùng lặp (`idempotencyKey`) để bảo đảm hệ thống không bao giờ bị trừ tiền lặp lại khi người dùng bấm nhiều lần do lag mạng.
* **Xác thực và Bảo mật (Thành viên 4):** Xây dựng luồng đăng ký, đăng nhập xác thực JWT Bearer, băm mật khẩu một chiều với thuật toán `bcrypt` (Salt = 10) và thiết lập tầng bảo vệ `JwtAuthGuard`.
* **Đóng gói Docker & Kiểm thử E2E (Thành viên 1):** Cung cấp cấu hình `docker-compose.yml` khởi chạy trọn gói Web + API + PostgreSQL, xây dựng endpoint giám sát sức khỏe `GET /health` và kịch bản E2E Test tự động 7 bước từ lúc duyệt menu đến khi xác nhận đơn.
* **Video Demo Luồng End-to-End (Task 5.4):** Trực quan hóa toàn bộ trải nghiệm từ duyệt Menu -> Tùy chọn -> Giỏ hàng -> Đặt đơn -> Thanh toán: [Xem trên YouTube Shorts](https://youtube.com/shorts/3twEhgP6Ggo?si=rSEn9NMpOBLGeavt).

### 2.2. Kiểm thử và Chất lượng Mã nguồn
* Tầng Unit Test kiểm tra độc lập các service tính giá và nghiệp vụ quan trọng.
* Tầng Integration Test kiểm tra giao dịch CSDL khi tạo đơn hàng và thanh toán.
* Tầng E2E Test tự động mô phỏng trọn vẹn hành vi người dùng cuối.
* Mọi yêu cầu nghiệp vụ đều được ánh xạ rõ ràng trong Ma trận truy vết (`traceability-matrix.md`).

---

## 3. Đánh giá Quy trình & Bài học Kinh nghiệm (Retrospective)

### 3.1. Những điểm làm tốt
* **Chiến lược phân nhánh rõ ràng:** Mỗi thành viên làm việc độc lập trên nhánh tính năng cá nhân (`feature/*`), không ai ghi đè trực tiếp lên nhánh `main`. Mọi thay đổi đều được rà soát qua Pull Request.
* **Tuân thủ quy ước Commit:** Áp dụng Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`) giúp lịch sử phát triển mạch lạc, minh bạch, dễ theo dõi tiến độ.
* **Kiểm thử tự động làm chốt chặn:** Pipeline CI/CD tự động phát hiện lỗi sớm trước khi mã nguồn được phép gộp vào nhánh chính.

### 3.2. Điểm cần rút kinh nghiệm
* Cần thống nhất chi tiết DTO và cấu trúc payload API sớm hơn giữa các thành viên phụ trách Frontend và Backend để tránh phải chỉnh sửa lại giao diện khi tích hợp.
* Việc thiết lập môi trường Docker nên được chuẩn hóa ngay từ ngày đầu đồ án để hạn chế sai lệch giữa môi trường phát triển của từng cá nhân.

### 3.3. Kết luận về Mức độ Sẵn sàng Bàn giao (Deployment Readiness)
Hệ thống BrewLite đã đạt toàn bộ các tiêu chí nghiệm thu đề ra: mã nguồn sạch, tài liệu kiến trúc và hướng dẫn triển khai đầy đủ, bộ test tự động hoạt động ổn định và sẵn sàng đưa lên môi trường sản phẩm thực tế.

---

**Nhóm thực hiện đồ án BrewLite:**
* Trần Vĩnh Thọ Lân (Thành viên 1)
* Nguyễn Tuấn Khôi (Thành viên 2)
* Phan Vũ Việt Quang (Thành viên 3)
* Nguyễn Hữu Chí Công (Thành viên 4)
