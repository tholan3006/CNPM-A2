# Tài liệu Thiết kế & Hướng dẫn Triển khai Hệ thống BrewLite (Deployment Guide)

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) -- Trường Đại học Sài Gòn  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Học kỳ:** I -- Năm học 2026--2027  
**Tác giả:** Trần Vĩnh Thọ Lân (Thành viên 1) cùng Nhóm phát triển BrewLite  

---

## 1. Mô hình Triển khai Tổng thể (Deployment Topology)

Hệ thống **BrewLite** được thiết kế để triển khai linh hoạt trên cả hai môi trường:
1. **Môi trường Phát triển & Kiểm thử Cục bộ (Local / Development):** Khởi chạy trọn gói bằng Docker Compose với một lệnh duy nhất.
2. **Môi trường Sản phẩm Thực tế (Production / Cloud):** Triển khai phân tán với Web PWA trên Edge CDN (Vercel / Cloudflare Pages) và Backend API / PostgreSQL trên nền tảng Cloud Container (Render / Railway / VPS Linux).

### Sơ đồ Triển khai Sản phẩm (Production Deployment Architecture)

```
[ THIẾT BỊ NGƯỜI DÙNG / KHÁCH HÀNG ]
       | (Smartphone / Laptop PWA)
       |
       | HTTPS (Port 443 / TLS 1.3)
       v
+-----------------------------------------------------------------------------------+
|                        TẦNG MẠNG CÔNG CỘNG (PUBLIC ZONE)                          |
|                                                                                   |
|   +---------------------------------------+   +-------------------------------+   |
|   |         EDGE CDN / STATIC HOST        |   |       REVERSE PROXY / SSL     |   |
|   |   Next.js 14 PWA (Port 3000 / 443)    |   |     Nginx / Cloudflare Proxy  |   |
|   |   https://brewlite.shop               |   |     https://api.brewlite.shop |   |
|   +-------------------+-------------------+   +---------------+---------------+   |
|                       |                                       |                   |
+-----------------------|---------------------------------------|-------------------+
                        | REST JSON API (Port 4000)             |
                        +---------------------------------------+
                                        | (Private Network Bridge)
                                        v
+-----------------------------------------------------------------------------------+
|                      TẦNG MẠNG NỘI BỘ (PRIVATE DOCKER NETWORK)                     |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                         BACKEND CONTAINER                                 |   |
|   |   NestJS API Application (Node.js 20 Alpine)                              |   |
|   |   - Internal Port: 4000                                                   |   |
|   |   - Health Check Endpoint: GET /health                                    |   |
|   |   - Môi trường: Production (JWT_SECRET, DATABASE_URL, PORT)               |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         | TCP Connection (Port 5432)              |
|                                         v                                         |
|   +---------------------------------------------------------------------------+   |
|   |                         DATABASE CONTAINER                                |   |
|   |   PostgreSQL 16 Alpine                                                    |   |
|   |   - Không mở cổng ra Internet (Chỉ chấp nhận kết nối từ Backend API)      |   |
|   |   - Persistent Storage: Volume 'postgres_data'                            |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Ranh giới Môi trường (Environment Boundaries: Local vs CI vs Production)

| Thành phần | Môi trường Local (Máy lập trình viên) | Môi trường CI (GitHub Actions Runner) | Môi trường Production (Cloud Host) |
|:---|:---|:---|:---|
| **Hạ tầng chạy** | Docker Desktop / Docker Engine (Windows/Mac/Linux) | Ubuntu Latest Virtual Machine (GitHub Hosted) | Linux Container (Render / Railway / VPS Docker) |
| **Cơ sở dữ liệu** | Container `brewlite_postgres` (Port 5432 nội bộ) | Container dịch vụ ephemeral PostgreSQL trong CI | PostgreSQL Managed Cloud có backup và persistent storage |
| **Quản trị Secret** | File `.env` cục bộ (được chặn bởi `.gitignore`) | GitHub Repository Secrets (`DATABASE_URL`, `JWT_SECRET`) | Biến môi trường hệ thống được mã hóa trên Cloud Dashboard |
| **Dữ liệu mẫu** | Chạy `npx prisma db seed` tự động khi build | Tự động sinh Schema bằng `prisma db push` | Chạy migration an toàn bằng `npx prisma migrate deploy` |
| **Bảo mật mạng** | Port 3000, 4000, 5432 map ra localhost | Mạng cô lập trong job runner của GitHub | Database chỉ nằm trong mạng nội bộ, cấm truy cập từ ngoài |

---

## 3. Cấu hình Cổng (Ports) & Biến Môi trường (Environment Variables)

### 3.1. Danh mục Cổng mạng
* **Port 80 / 443:** Cổng HTTPS công cộng tiếp nhận truy cập từ khách hàng.
* **Port 3000:** Cổng nội bộ phục vụ ứng dụng Frontend Next.js PWA.
* **Port 4000:** Cổng nội bộ phục vụ Backend NestJS API và Swagger UI.
* **Port 5432:** Cổng kết nối CSDL PostgreSQL (chỉ mở trong Docker bridge nội bộ).

### 3.2. Bảng Biến Môi trường Tiêu chuẩn
| Biến môi trường | Mục đích | Ví dụ môi trường Local | Ví dụ môi trường Production |
|:---|:---|:---|:---|
| `DATABASE_URL` | Chuỗi kết nối tới cơ sở dữ liệu PostgreSQL | `postgresql://postgres:postgrespassword@postgres:5432/brewlite` | `postgresql://user:secret@db.internal:5432/brewlite` |
| `JWT_SECRET` | Khóa bí mật ký và giải mã Bearer Token | `brewlite_local_secret_key_sgu_2026` | Chuỗi ngẫu nhiên 64 ký tự hex bảo mật cao |
| `PORT` | Cổng lắng nghe của NestJS API Server | `4000` | `4000` |
| `NODE_ENV` | Chế độ thực thi ứng dụng | `development` | `production` |
| `NEXT_PUBLIC_API_URL` | Địa chỉ Backend mà Frontend gửi request | `http://localhost:4000` | `https://api.brewlite.shop` |

---

## 4. Quy trình Tự động hóa CI/CD (Pipeline Workflow)

Toàn bộ quy trình từ lúc lập trình viên commit mã nguồn đến khi hệ thống tự động kiểm thử và sẵn sàng triển khai được cấu hình tự động qua GitHub Actions:

### 4.1. Continuous Integration (CI) - `.github/workflows/ci.yml`
* **Sự kiện kích hoạt:** Mọi sự kiện mở Pull Request hoặc đẩy code vào nhánh `main` và các nhánh tính năng `feature/*`.
* **Quy trình tuần tự (Quality Gate):**
  $$\text{Code Checkout} \longrightarrow \text{Setup Node.js 20} \longrightarrow \text{Install Dependencies} \longrightarrow \text{Prisma Generate} \longrightarrow \text{Linting} \longrightarrow \text{Unit/Integration Tests} \longrightarrow \text{Next.js Build}$$
* **Nguyên tắc nghiêm ngặt:** Nếu bất kỳ bài kiểm tra lint hoặc test nào thất bại, Pull Request sẽ bị chặn merge tự động.

### 4.2. Continuous Delivery & Deployment (CD) - `.github/workflows/cd.yml`
* **Sự kiện kích hoạt:** Khi merge code vào nhánh `main` hoặc khi gắn thẻ phiên bản Release (ví dụ `v1.0.0`).
* **Các giai đoạn:**
  1. **Quality Gate:** Xác nhận lại toàn bộ Unit Test và Lint.
  2. **Build & Package:** Đóng gói Docker Images cho API và Web, gắn nhãn (tag) bằng mã commit SHA rút gọn (`SHA_SHORT`).
  3. **Deploy Host:** Triển khai image lên Cloud server và kích hoạt di trú dữ liệu `prisma migrate deploy`.
  4. **Automated Smoke Test:** Tự động gửi request kiểm tra endpoint `GET /health`. Nếu kết quả trả về `status: "ok"`, hoàn tất đợt phát hành; nếu lỗi hoặc timeout, lập tức kích hoạt cơ chế Rollback về phiên bản SHA ổn định liền trước.

---

## 5. Hướng dẫn Vận hành Cục bộ (Local Run with Docker)

Để chạy trọn gói hệ thống trên máy cá nhân mà không cần cài đặt PostgreSQL hay cấu hình môi trường phức tạp:

```powershell
# 1. Clone kho mã nguồn
git clone https://github.com/tholan3006/CNPM-A2.git
cd CNPM-A2

# 2. Khởi tạo cấu hình môi trường mẫu
Copy-Item .env.example .env

# 3. Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up --build -d

# 4. Kiểm tra trạng thái các container
docker compose ps
```

* **Truy cập Giao diện Web (PWA):** `http://localhost:3000`
* **Truy cập Tài liệu API (Swagger UI):** `http://localhost:4000/api/docs`
* **Kiểm tra Sức khỏe Hệ thống (Health Check):** `http://localhost:4000/health`
* **Dừng hệ thống:** `docker compose down`

---

## 6. Cơ chế Phục hồi Sự cố (Rollback Strategy)

Khi một bản phát hành mới gặp sự cố nghiêm trọng trên môi trường Production:
1. **Rollback Container qua Docker Tag:**
   ```bash
   # Chuyển container chạy về phiên bản SHA trước đó
   docker stop brewlite_api
   docker run -d --name brewlite_api brewlite-api:<PREVIOUS_STABLE_SHA>
   ```
2. **Rollback Cơ sở dữ liệu:**
   Prisma hỗ trợ xem nhật ký di trú qua bảng `_prisma_migrations`. Nếu schema mới gây lỗi, khôi phục từ bản sao lưu Snapshot hàng ngày của PostgreSQL và áp dụng script down-migration tương ứng.
3. **Rollback nhanh qua Git Tag:**
   ```powershell
   git checkout tags/v1.0.0
   docker compose up --build -d
   ```
