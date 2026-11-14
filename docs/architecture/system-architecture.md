# Báo cáo Thiết kế Kiến trúc Hệ thống BrewLite (System Architecture Document)

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) -- Trường Đại học Sài Gòn  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Học kỳ:** I -- Năm học 2026--2027  
**Nhóm sinh viên thực hiện:**
- **Trần Vĩnh Thọ Lân (MSSV: 3124560049) - Thành viên 1**
- **Nguyễn Tuấn Khôi (MSSV: 3124410190) - Thành viên 2**
- **Phan Vũ Việt Quang (MSSV: 3124410385) - Thành viên 3**
- **Nguyễn Hữu Chí Công (MSSV: 3124410044) - Thành viên 4**

---

## 1. Tổng quan Kiến trúc Đề xuất

Hệ thống **BrewLite** được thiết kế theo mô hình **Monorepo** phân tán nhiều tầng (Layered Architecture) kết hợp tư duy mô hình hoá **C4 Model** (Context, Container, Component, Code), tối ưu hóa trải nghiệm đặt món di động theo hướng **Mobile-First Progressive Web App (PWA)**, backend xử lý giao dịch chuẩn **NestJS Modular Architecture**, dữ liệu lưu trữ quan hệ **PostgreSQL 16** với cơ chế di trú Schema thông qua **Prisma ORM**.

```
+-----------------------------------------------------------------------------------+
|                            NGƯỜI DÙNG / KHÁCH HÀNG                                 |
|                   (Điện thoại thông minh / Trình duyệt PWA)                       |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / WSS (Port 443/3000)
                                          v
+-----------------------------------------------------------------------------------+
|                        TẦNG TRÌNH DIỄN (PRESENTATION LAYER)                       |
|   Next.js 14 App Router (React 18, Tailwind CSS, Lucide Icons, Zustand Store)     |
|   - apps/web/src/app/ (Menu, Cart, Checkout, Order Tracking)                      |
|   - apps/web/src/components/ (Modals, ProductDetail, CartDrawer, Navbar)          |
+-----------------------------------------+-----------------------------------------+
                                          | JSON REST API / Bearer JWT (Port 4000)
                                          v
+-----------------------------------------------------------------------------------+
|                       TẦNG NGHIỆP VỤ & API (BUSINESS LOGIC LAYER)                 |
|   NestJS 10 Framework (TypeScript, Fastify/Express Adapter, Swagger OpenAPI)      |
|   - ProductsModule: Danh mục, thực đơn, tính giá size & topping                   |
|   - OrdersModule: Quản lý vòng đời đơn, máy trạng thái đơn hàng                   |
|   - PaymentsModule: Cổng thanh toán thẻ/ví mô phỏng, xử lý Idempotency            |
|   - AuthModule: Đăng ký/đăng nhập, băm mật khẩu Bcrypt, ký JWT Bearer             |
|   - Health & Core: Giám sát GET /health, Exception Filters, Global Validation     |
+-----------------------------------------+-----------------------------------------+
                                          | Prisma Client ORM (TCP Socket)
                                          v
+-----------------------------------------------------------------------------------+
|                         TẦNG DỮ LIỆU (DATA ACCESS LAYER)                          |
|   PostgreSQL 16 Alpine Database (Chạy trong Docker Private Network)               |
|   - Bảng: User, Product, Category, ProductOption, Order, OrderItem, Payment       |
|   - Khóa ngoại, Chỉ mục Indexing, Transaction Isolation (Read Committed)          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Chi tiết các Tầng Kiến trúc (Architectural Layers)

### 2.1. Tầng Trình diễn (Presentation Layer - `apps/web`)
* **Công nghệ cốt lõi:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Zustand.
* **Chiến lược Mobile-first PWA:** Thiết kế giao diện ưu tiên màn hình dọc của thiết bị di động (375px - 430px), tích hợp Service Worker hỗ trợ cài đặt icon ra màn hình chính, phản hồi nhanh nhạy dưới 200ms.
* **Quản lý trạng thái Client:** Sử dụng **Zustand** (`cartStore.ts`) với khả năng đồng bộ `localStorage`, đảm bảo khách hàng không bị mất giỏ hàng khi làm mới trang hoặc mất kết nối mạng tạm thời.
* **Validation đầu vào:** Sử dụng bộ kiểm tra số điện thoại 10 số thời gian thực (`PhoneRegex: /^0[0-9]{9}$/`), định dạng tiền tệ Việt Nam Đồng (`Intl.NumberFormat`).

### 2.2. Tầng Nghiệp vụ & Dịch vụ API (Business & Service Layer - `apps/api`)
* **Công nghệ cốt lõi:** NestJS (Node.js LTS v20), TypeScript strict mode, Prisma Client.
* **Phân rã theo Domain Module:**
  1. `ProductsModule`: Cung cấp API `GET /products`, `GET /products/:id`, `POST /products/:id/calculate-price`.
  2. `OrdersModule`: Xử lý tạo đơn hàng (`POST /orders`), khóa bi quan / optimistic check số lượng tồn, quản lý chuyển dịch trạng thái đơn qua `OrderLifecycleService` (PENDING $\rightarrow$ PAID $\rightarrow$ COMPLETED / CANCELLED).
  3. `PaymentsModule`: Tiếp nhận yêu cầu thanh toán (`POST /payments`), kiểm tra khóa chống trùng lặp `Idempotency-Key` ngăn chặn trừ tiền 2 lần.
  4. `AuthModule`: Xác thực thông tin người dùng qua chiến lược `Passport JWT`, băm mật khẩu bằng thuật toán `bcrypt` với Salt Rounds = 10.
* **Tầng phòng vệ (Security & Validation Pipeline):**
  * `ValidationPipe`: Tự động loại bỏ các thuộc tính rác (`whitelist: true`) và kiểm tra kiểu dữ liệu DTO nghiêm ngặt (`forbidNonWhitelisted: true`).
  * `JwtAuthGuard`: Chặn đứng mọi truy vấn thiếu token hoặc token hết hạn ở các endpoint bảo mật.

### 2.3. Tầng Dữ liệu & Lưu trữ (Data Access Layer)
* **Cơ sở dữ liệu:** PostgreSQL 16 Alpine.
* **Cơ chế Quản lý & Di trú (Migration):**
  * Định nghĩa thực thể dữ liệu tập trung qua `prisma/schema.prisma`.
  * Cơ chế `prisma migrate dev` tự động sinh các file SQL Migration có gắn dấu vết thời gian (timestamp).
  * Hạt giống dữ liệu (Database Seeding) qua `prisma/seed.ts` cung cấp sẵn danh mục cà phê, trà, cold brew, topping và tài khoản dùng thử để nghiệm thu tức thời.

### 2.4. Hệ thống Giám sát & Endpoint Sức khỏe (Health Check & Logging)
* Cung cấp endpoint chuẩn quốc tế: `GET /health` (`app.controller.ts`).
* Phản hồi trạng thái CSDL PostgreSQL (`healthy` / `unhealthy`), thời gian hoạt động (`uptime`), mức tiêu thụ bộ nhớ (`memoryUsage`) và phiên bản hệ thống.
* Định dạng phản hồi JSON:
```json
{
  "status": "ok",
  "timestamp": "2026-11-14T23:30:00.000Z",
  "uptime": 1245.8,
  "database": "healthy",
  "version": "1.0.0"
}
```

---

## 3. Lý do lựa chọn Kiến trúc & Phân tích Đánh đổi (Trade-offs)

| Quyết định Kiến trúc | Lý do lựa chọn | Ưu điểm (Pros) | Đánh đổi / Thách thức (Cons & Trade-offs) | Giải pháp khắc phục |
|:---|:---|:---|:---|:---|
| **Cấu trúc Monorepo** | Toàn bộ mã nguồn Web, API, Tài liệu và CI/CD nằm chung 1 kho | Đồng bộ phiên bản 100%, dùng chung kiểu TypeScript DTO/Interface, 1 commit/PR kiểm thử trọn gói | Kích thước repo tăng, cấu hình CI phức tạp hơn so với chia lẻ repo | Phân tách sub-path trong GitHub Actions (`apps/web/**`, `apps/api/**`) |
| **Next.js 14 App Router** | Hỗ trợ Server-Side Rendering (SSR) và Client Component linh hoạt | Tối ưu SEO, tốc độ tải trang ban đầu cực nhanh ($<500$ms), hỗ trợ tốt PWA | Phức tạp trong việc phân định `'use client'` và Server Actions | Tách rõ thư mục `components/` tương tác và `app/` điều hướng |
| **NestJS Modular** | Kiến trúc hướng Module hóa, Dependency Injection (DI) chuẩn mực | Mã nguồn rõ ràng, dễ viết Unit/Integration Test độc lập, chuẩn hóa doanh nghiệp | Cấu hình ban đầu nặng hơn Express thuần | Áp dụng cấu trúc thư mục domain chuẩn theo tài liệu NestJS |
| **Prisma ORM & PostgreSQL** | Bảo toàn tính toàn vẹn ACID, Type-safety từ CSDL lên TypeScript | Tự động sinh kiểu dữ liệu Type-safe, quản lý quan hệ 1-n, n-n minh bạch | Tiêu tốn bộ nhớ hơn raw SQL query ở tải hàng trăm ngàn RPS | Đặt Indexing hợp lý trên các trường `categoryId`, `orderId`, `phone` |

---

## 4. Danh mục Bản ghi Quyết định Kiến trúc (ADR Index)

Toàn bộ các quyết định kỹ thuật then chốt được lưu vết chi tiết trong thư mục `docs/architecture/adr/`:
1. [ADR 001: Lựa chọn Mô hình Monorepo](adr/001-monorepo.md)
2. [ADR 002: Lựa chọn Next.js App Router và Mobile-First PWA](adr/002-frontend-nextjs-pwa.md)
3. [ADR 003: Lựa chọn Kiến trúc Modular NestJS cho Backend API](adr/003-backend-nestjs-modular.md)
4. [ADR 004: Lựa chọn PostgreSQL và Prisma ORM cho Quản lý Dữ liệu](adr/004-database-postgresql-prisma.md)
5. [ADR 005: Cơ chế Xác thực Phi trạng thái qua JWT và Mã hóa Bcrypt](adr/005-stateless-auth-jwt.md)
6. [ADR 006: Mô phỏng Cổng thanh toán & Cơ chế Idempotency Chống Trùng lặp](adr/006-payment-mock-idempotency.md)
