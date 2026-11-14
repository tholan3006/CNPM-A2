# ADR 001: Lựa chọn Mô hình Monorepo (Repository Structure)

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Trần Vĩnh Thọ Lân (Thành viên 1)
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Đồ án BrewLite yêu cầu phát triển một hệ thống hoàn chỉnh từ yêu cầu, mô hình hóa, mã nguồn Web (Next.js), Backend API (NestJS), kiểm thử, tài liệu (UML, SRS, Báo cáo) và triển khai tự động CI/CD. Đội ngũ gồm 4 thành viên cùng phát triển đồng thời trên các phần việc khác nhau. Cần một cấu trúc kho mã nguồn bảo đảm:
1. Đồng bộ mã nguồn giữa Frontend và Backend.
2. Dễ dàng truy vết tài liệu (`docs/`) với mã nguồn (`apps/`).
3. Một lệnh kiểm thử CI duy nhất có thể chạy toàn diện hệ thống.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: Multi-repo (Tách riêng biệt các repo `brewlite-web`, `brewlite-api`, `brewlite-docs`):**
  * *Ưu điểm:* Mỗi repo độc lập, nhẹ nhàng, phân quyền riêng biệt.
  * *Nhược điểm:* Khó đồng bộ API DTO và hợp đồng dữ liệu; việc đồng bộ tài liệu yêu cầu (SRS, UML) với mã nguồn bị phân mảnh; pipeline CI/CD chạy rời rạc khiến việc kiểm thử luồng end-to-end rất khó khăn.
* **Phương án B: Monorepo (Gom chung toàn bộ vào một repo duy nhất `CNPM-A2`):**
  * *Ưu điểm:* 1 Pull Request có thể cập nhật cả mã nguồn Web, mã nguồn API và tài liệu ma trận truy vết; dùng chung cấu hình Docker Compose và GitHub Actions CI/CD; đảm bảo tính toàn vẹn phiên bản (Single Source of Truth).
  * *Nhược điểm:* Repo có dung lượng lớn hơn; cấu hình đường dẫn CI phức tạp hơn.

## 3. Quyết định (Decision)
Nhóm quyết định lựa chọn **Phương án B: Monorepo** với cấu trúc thư mục quy chuẩn:
```text
brewlite/
├── apps/
│   ├── web/        # Next.js mobile-first PWA
│   └── api/        # NestJS REST API
├── docs/           # Tài liệu SRS, UML diagrams, ADR, Báo cáo cá nhân
├── tests/          # Kịch bản kiểm thử E2E tích hợp
├── .github/        # GitHub Actions CI/CD Workflows
└── docker-compose.yml
```

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Mọi thành viên chỉ cần clone 1 kho mã nguồn; dễ dàng chạy toàn bộ hệ thống bằng lệnh `docker compose up --build`; kiểm soát phiên bản tài liệu đi kèm mã nguồn theo đúng chuẩn Task 4.1 và Task 4.2 của đề bài.
* **Tiêu cực / Thách thức:** Phải cấu hình đường dẫn `working-directory` trong GitHub Actions để phân định rõ việc chạy lint/test cho `apps/api` và `apps/web`.
