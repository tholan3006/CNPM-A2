# Đặc tả Yêu cầu Phi chức năng & SRS: Phân hệ Đăng nhập, Đăng ký & Bảo mật Xác thực (JWT & Bcrypt)

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) – Khóa 2026–2027  
**Đơn vị:** Khoa Công nghệ Thông tin – Trường Đại học Sài Gòn (SGU)  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Tên đề tài đồ án:** BrewLite – Hệ thống Đặt đồ uống & Thanh toán không tiền mặt  
**Sinh viên thực hiện:** Nguyễn Hữu Chí Công (MSSV: 3124720010 – Thành viên 5)  
**Phân công:** Màn hình & Luồng "Đăng nhập & Đăng ký", Bảo mật JWT/Bcrypt & Hạ tầng Docker/CI-CD  
**Mã tài liệu:** `REQ-NFR-05` (Mã yêu cầu: **FR-08**, **NFR-02**, **NFR-03**)  
**Trạng thái:** Hoàn thiện nghiệm thu Sprint 2 & Sprint 3  

---

## 1. Giới thiệu và Bối cảnh Phân hệ (Introduction & Context)

### 1.1. Mục đích tài liệu (Purpose)
Tài liệu này đặc tả toàn diện các **Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)** về bảo mật mật khẩu (`bcrypt`), xác thực phi trạng thái (`JSON Web Token - JWT`), phân quyền dựa trên vai trò (`RBAC`), kiểm tra dữ liệu đầu vào hai lớp, cùng kiến trúc triển khai `Docker Compose`, `CI/CD Pipeline` và bảo mật `Environment Secrets`. Đồng thời, tài liệu đặc tả chi tiết các **Yêu cầu Chức năng (Functional Requirements - FR-08)** cho màn hình và luồng **"Đăng nhập & Đăng ký"** của hệ thống **BrewLite**.

### 1.2. Vai trò của Phân hệ Xác thực trong Chuỗi Nghiệp vụ BrewLite
Trong hệ thống đặt đồ uống và thanh toán không tiền mặt **BrewLite**, phân hệ Đăng nhập & Đăng ký đóng vai trò là **Lớp Phòng thủ và Định danh Trung tâm (Identity & Access Management Layer)**:
* **Định danh khách hàng đặt đơn:** Mọi đơn hàng (`POST /orders`) và giao dịch thanh toán không tiền mặt (`POST /payments`) đều bắt buộc gắn liền với một định danh người dùng hợp lệ (`userId` trích xuất từ JWT Token) để tránh đơn hàng ảo và đảm bảo đối soát tài chính.
* **Tích lũy điểm thưởng thành viên (Loyalty Points):** Lưu trữ và cộng dồn điểm thưởng (`loyaltyPoints`) chính xác vào tài khoản khách hàng sau mỗi giao dịch thanh toán `PAID` thành công (1 điểm cho mỗi $10.000\text{ đ}$).
* **Phân tách luồng vận hành theo vai trò (RBAC):** Phân biệt rõ quyền hạn giữa Khách hàng (`CUSTOMER` – đặt món, thanh toán, xem lịch sử đơn cá nhân), Nhân viên pha chế (`BARISTA` – tiếp nhận và cập nhật trạng thái đơn tại quầy qua State Machine), và Quản trị viên (`ADMIN`).

---

## 2. Đặc tả Yêu cầu Phi chức năng (Non-Functional Requirements – Security, JWT, Bcrypt & DevOps)

### 2.1. Bảng Tổng hợp các Yêu cầu Phi chức năng (NFR Summary Table)

| Mã NFR | Nhóm yêu cầu | Tên yêu cầu phi chức năng | Chỉ số kỹ thuật & Tiêu chí nghiệm thu (Metrics & Acceptance Criteria) |
|:---:|:---|:---|:---|
| **NFR-SEC-01** | Bảo mật lưu trữ | **Băm mật khẩu một chiều bằng thuật toán `bcrypt`** | - Tuyệt đối không lưu mật khẩu dạng văn bản thuần (plaintext) trong CSDL hoặc log.<br>- Sử dụng thuật toán `bcrypt` với hệ số chi phí **Salt Rounds = 10** (`$2b$10$...`).<br>- Kiểm tra mật khẩu bằng hàm chống tấn công thời gian `bcrypt.compare()`.<br>- Loại bỏ 100% trường `passwordHash` khỏi mọi payload JSON trả về Client. |
| **NFR-SEC-02** | Bảo mật xác thực | **Xác thực phi trạng thái bằng JSON Web Token (JWT)** | - Ký số bằng thuật toán **HMAC-SHA256 (`HS256`)** thông qua `@nestjs/jwt`.<br>- Payload chứa định danh tối thiểu: `{ sub: user.id, email: user.email, role: user.role }`.<br>- Thời hạn token (`expiresIn`) cấu hình chuẩn `7d`, từ chối ngay token hết hạn hoặc sai chữ ký (`401 Unauthorized`).<br>- `JwtStrategy.validate()` đối chiếu lại sự tồn tại của `user.id` trong PostgreSQL. |
| **NFR-SEC-03** | Kiểm soát truy cập | **Bảo vệ Route nhạy cảm & Phân quyền RBAC** | - `JwtAuthGuard` chặn 100% request không có Bearer Token hợp lệ vào `GET /auth/me`, `POST /orders`, `GET /orders/me`, `POST /payments`.<br>- `RolesGuard` kết hợp `@Roles(Role.BARISTA, Role.ADMIN)` kiểm soát chặt các thao tác điều phối đơn hàng tại quầy. |
| **NFR-VAL-04** | Toàn vẹn dữ liệu | **Kiểm tra dữ liệu đầu vào 2 lớp (Dual-Layer Validation)** | - **Frontend (`AuthModal.tsx`):** Chặn gõ ký tự chữ vào ô Số điện thoại theo thời gian thực (`onKeyDown`), ép chuẩn đúng **10 chữ số**.<br>- **Backend (`ValidationPipe` + `class-validator`):** Kiểm tra `@IsEmail()`, `@MinLength(6)` cho mật khẩu, tự động `trim().toLowerCase()` cho email và bật `whitelist: true` để loại bỏ trường rác. |
| **NFR-DEP-05** | Hạ tầng & Triển khai | **CI/CD Pipeline, SSL/HTTPS & Quản lý Secrets** | - Khoá bí mật `JWT_SECRET` và `DATABASE_URL` được nạp từ Environment Secrets Vault, kiểm tra nghiêm ngặt khi khởi động qua `getJwtSecret()`.<br>- Kết nối từ trình duyệt tới hệ thống được mã hóa qua **HTTPS / TLS 1.3**.<br>- GitHub Actions CI tự động chạy `prisma generate`, `npm run build` và `jest` cho cả Backend và Frontend trên mỗi lần `push` / `pull_request`. |

---

### 2.2. Thiết kế Kỹ thuật Chi tiết cho Bảo mật `bcrypt` và `JWT`

#### a) Cơ chế băm mật khẩu một chiều với `bcrypt` (NFR-SEC-01)
1. **Quy trình Đăng ký (`AuthService.register`):**
   - Chuẩn hóa địa chỉ email: `const normalizedEmail = dto.email.trim().toLowerCase();`.
   - Kiểm tra trùng lặp trên chỉ mục `@unique` của cột `email`. Nếu đã tồn tại, ném ngoại lệ `409 ConflictException('Email is already registered')`.
   - Sinh chuỗi băm mật khẩu bất đồng bộ: `const passwordHash = await bcrypt.hash(dto.password, 10);`. Chuỗi kết quả dài 60 ký tự theo định dạng chuẩn `$2b$10$<22-char-salt><31-char-hash>`, chống lại hoàn toàn tấn công từ điển (Dictionary Attack) và bảng cầu vồng (Rainbow Table Attack).
2. **Quy trình Đăng nhập (`AuthService.login`):**
   - Tìm kiếm người dùng theo `normalizedEmail`. Nếu không tồn tại, trả về thông báo chung `'Invalid email or password'` (`401 Unauthorized`) nhằm chống dò quét tài khoản (User Enumeration Prevention).
   - Đối chiếu mật khẩu bằng `await bcrypt.compare(dto.password, user.passwordHash)`.

#### b) Kiến trúc Xác thực JWT & Passport Strategy (NFR-SEC-02 & NFR-SEC-03)
1. **Cấu trúc Token (`AuthToken`):**
   - **Header:** `{"alg": "HS256", "typ": "JWT"}`
   - **Payload:** `{"sub": "<uuid-v4>", "email": "customer@brewlite.com", "role": "CUSTOMER", "iat": 1763000000, "exp": 1763604800}`
   - **Signature:** `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)`
2. **Cơ chế Xác thực Hai Tầng trong `JwtStrategy`:**
   - **Tầng 1 (Cryptographic Verification):** Trích xuất token từ header `Authorization: Bearer <token>` thông qua `ExtractJwt.fromAuthHeaderAsBearerToken()`, kiểm tra chữ ký số với `getJwtSecret()` và kiểm tra hạn sử dụng (`ignoreExpiration: false`).
   - **Tầng 2 (Database Existence Check):** Hàm `validate(payload: JwtPayload)` truy vấn `prisma.user.findUnique({ where: { id: payload.sub } })` để đảm bảo tài khoản chưa bị thu hồi và nạp thông tin `loyaltyPoints`, `role` mới nhất vào `req.user`.

---

## 3. Đặc tả Yêu cầu Chức năng Phân hệ "Đăng nhập & Đăng ký" (FR-08)

### 3.1. Bảng Yêu cầu Chức năng (Functional Requirements)

| Mã YC | Tên yêu cầu chức năng | Ưu tiên (MoSCoW) | Tiêu chí chấp nhận (Acceptance Criteria) |
|:---:|:---|:---:|:---|
| **FR-08.1** | **Đăng ký tài khoản khách hàng mới** (`POST /auth/register`) | **Must** | - Người dùng nhập Họ tên, Số điện thoại (đúng 10 chữ số), Email hợp lệ và Mật khẩu ($\ge 6$ ký tự).<br>- Hệ thống kiểm tra trùng email (`409 Conflict`), băm mật khẩu bằng `bcrypt` (cost = 10), tạo bản ghi `User` với `role = CUSTOMER`, `loyaltyPoints = 0`.<br>- Trả về `HTTP 201 Created` kèm `access_token` và thông tin `user` để tự động đăng nhập ngay sau khi đăng ký. |
| **FR-08.2** | **Đăng nhập hệ thống** (`POST /auth/login`) | **Must** | - Người dùng nhập Email và Mật khẩu trên `AuthModal`.<br>- Hệ thống xác thực qua `bcrypt.compare()`, trả về `HTTP 200 OK` kèm `access_token` và hồ sơ người dùng.<br>- Nếu người dùng có vai trò `BARISTA`, giao diện tự động điều hướng tới trang Quản lý đơn hàng (`/orders`). |
| **FR-08.3** | **Truy vấn hồ sơ & Điểm thưởng** (`GET /auth/me`) | **Must** | - Yêu cầu đính kèm `Authorization: Bearer <token>`.<br>- Trả về thông tin định danh (`id`, `email`, `fullName`, `phone`, `role`, `loyaltyPoints`) phục vụ hiển thị trên thanh điều hướng (`Navbar`). |
| **FR-08.4** | **Quản lý phiên làm việc phía Client & Bảo vệ Route** | **Must** | - Lưu trữ trạng thái đăng nhập (`user`, `accessToken`, `isLoggedIn`) vào `Zustand Persist` (`localStorage`).<br>- Khi khách hàng chưa đăng nhập nhấn "Đặt hàng / Thanh toán", hệ thống tự động bật `AuthModal` yêu cầu xác thực trước khi gọi `POST /orders`. |

---

### 3.2. Đặc tả Use-Case Chi tiết: Đăng ký, Đăng nhập & Xác thực JWT (`UC-06`)

| Thuộc tính | Nội dung chi tiết |
|:---|:---|
| **Mã Use Case** | **UC-06: Đăng ký, Đăng nhập & Quản lý phiên xác thực JWT** |
| **Tác nhân (Actors)** | Khách vãng lai (Guest), Người dùng đã xác thực (Customer / Barista / Admin) |
| **Mô tả tóm tắt** | Người dùng mở hộp thoại xác thực (`AuthModal`) để đăng ký tài khoản mới hoặc đăng nhập vào hệ thống; hệ thống băm/kiểm tra mật khẩu với `bcrypt`, cấp phát `JWT Access Token` và lưu phiên làm việc để mở khóa tính năng đặt đơn & thanh toán. |
| **Tiền điều kiện (Preconditions)** | 1. Ứng dụng Web PWA kết nối thành công tới Backend API (`http://localhost:4000`).<br>2. Biến môi trường `JWT_SECRET` và kết nối PostgreSQL hoạt động bình thường. |
| **Hậu điều kiện (Postconditions)** | 1. Bản ghi `User` được tạo mới (nếu Đăng ký) với mật khẩu đã băm `bcrypt`.<br>2. Client nhận và lưu trữ `accessToken` cùng thông tin `user` vào `cartStore` (`localStorage`).<br>3. Thanh `Navbar` hiển thị tên người dùng, số điểm thưởng (`loyaltyPoints`) và cho phép thực hiện `POST /orders`, `POST /payments`. |
| **Luồng sự kiện chính – Đăng ký (Happy Path A)** | 1. Khách vãng lai nhấn nút **"Đăng nhập / Đăng ký"** trên `Navbar` và chuyển sang tab **"Đăng ký"**.<br>2. Người dùng nhập Họ tên, Số điện thoại (10 chữ số), Email và Mật khẩu ($\ge 6$ ký tự).<br>3. `AuthModal` kiểm tra hợp lệ tức thời trên từng phím bấm (`handlePhoneKeyDown`, `handlePhoneChange`).<br>4. Người dùng nhấn nút **"Tạo tài khoản"** $\rightarrow$ Client gửi `POST /auth/register`.<br>5. `AuthController` xác thực DTO qua `ValidationPipe` và chuyển tiếp xuống `AuthService.register(dto)`.<br>6. `AuthService` chuẩn hóa email, kiểm tra chưa tồn tại trong bảng `users`, băm mật khẩu bằng `bcrypt.hash(password, 10)` và lưu vào PostgreSQL.<br>7. `AuthService` ký `JWT Access Token` (`expiresIn: '7d'`) và trả về `HTTP 201 Created`.<br>8. `AuthModal` gọi `setAuth(user, token)`, hiển thị thông báo thành công và đóng hộp thoại. |
| **Luồng sự kiện chính – Đăng nhập (Happy Path B)** | 1. Người dùng chọn tab **"Đăng nhập"**, nhập Email và Mật khẩu, nhấn **"Đăng nhập"**.<br>2. Client gửi `POST /auth/login` tới `AuthController`.<br>3. `AuthService.login(dto)` truy vấn `User` theo email và kiểm tra `bcrypt.compare(dto.password, user.passwordHash)`.<br>4. Mật khẩu khớp $\rightarrow$ Hệ thống ký `JWT Access Token` và trả về `HTTP 200 OK`.<br>5. Client lưu phiên qua `setAuth(user, token)`; nếu `role === 'BARISTA'` thì điều hướng sang `/orders`. |
| **Luồng ngoại lệ (Exception Flows)** | - **Exc-1 (Nhập sai định dạng SĐT trên UI):** Khi người dùng gõ chữ cái hoặc nhập $< 10$ / $> 10$ chữ số, `AuthModal` chặn phím bấm và hiển thị cảnh báo đỏ ngay dưới ô nhập.<br>- **Exc-2 (Email đã tồn tại khi Đăng ký – HTTP 409):** Backend trả về `409 ConflictException('Email is already registered')`; giao diện giữ nguyên dữ liệu đã nhập và báo lỗi.<br>- **Exc-3 (Sai Email hoặc Mật khẩu khi Đăng nhập – HTTP 401):** Backend trả về `401 UnauthorizedException('Invalid email or password')`.<br>- **Exc-4 (Gọi API Đặt đơn/Thanh toán khi thiếu hoặc hết hạn JWT – HTTP 401):** `JwtAuthGuard` từ chối request trước khi vào Controller và trả về `401 Unauthorized`. |

---

## 4. Kiến trúc Đóng gói Docker & Đường ống CI/CD (Deployment & DevSecOps)

Thành viên 5 phụ trách thiết lập hạ tầng đóng gói và kiểm tra tự động cho toàn bộ monorepo:
1. **Container hóa với `Docker Compose` (`docker-compose.yml`):**
   - `brewlite_postgres` (`postgres:16-alpine`): Lưu trữ bền vững qua volume `postgres_data`, cấu hình `healthcheck` (`pg_isready -U postgres -d brewlite`) mỗi 5 giây.
   - `brewlite_backend` (`backend/Dockerfile`): Multi-stage build từ `node:20-alpine`, tự động chạy `npx prisma generate`, khởi chạy sau khi `postgres` đạt trạng thái `service_healthy`.
   - `brewlite_frontend` (`frontend/Dockerfile`): Multi-stage build tối ưu kích thước image cho Next.js 14 App Router, kết nối tới API qua `NEXT_PUBLIC_API_URL`.
2. **Đường ống Tích hợp Liên tục (`GitHub Actions CI` – `.github/workflows/ci.yml`):**
   - Tự động kích hoạt khi có sự kiện `push` hoặc `pull_request` vào nhánh `main`.
   - Gồm 2 job song song (`Backend Build` & `Frontend Build`) trên môi trường `ubuntu-latest` với Node.js 20, thực hiện cài đặt dependencies, sinh Prisma Client, kiểm tra biên dịch TypeScript và chạy bộ kiểm thử tự động.

---
*Tài liệu được biên soạn phục vụ học phần Công nghệ Phần mềm – Đại học Sài Gòn (SGU).*
