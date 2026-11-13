# TỔNG HỢP TÀI NGUYÊN & MÃ NGUỒN: THÀNH VIÊN 2 (TV2)
## Phân hệ: Màn hình & Luồng "Chi tiết sản phẩm & Tùy chọn món"
**Đồ án:** BrewLite – Hệ thống Đặt đồ uống & Thanh toán không tiền mặt  
**Môn học:** Công nghệ Phần mềm (Software Engineering) – ĐH Sài Gòn (SGU)  
**Mã yêu cầu phụ trách:** `FR-03`, `NFR-01`, `NFR-02`

---

### Cấu trúc Thư mục TV2:

```
TV2/
├── diagrams/                       # 5 Sơ đồ UML (cả PlantUML .puml và Vector .svg)
│   ├── usecase-detail.puml         # 1. Use Case Diagram
│   ├── usecase-detail.svg
│   ├── activity-detail.puml        # 2. Activity Diagram (4 Swimlanes)
│   ├── activity-detail.svg
│   ├── sequence-detail.puml        # 3. Sequence Diagram (GET /products/:id)
│   ├── sequence-detail.svg
│   ├── class-product-option.puml   # 4. Class Diagram (Lớp ProductOption, Size, Topping)
│   ├── class-product-option.svg
│   ├── deployment-product-db.puml  # 5. Deployment Diagram (PostgreSQL Data Structure)
│   └── deployment-product-db.svg
│
├── requirements/                   # Đặc tả yêu cầu & Ma trận truy vết
│   ├── srs-product-options.md      # Tài liệu đặc tả SRS chi tiết (IEEE 830)
│   └── traceability-matrix.md      # Ma trận truy vết hệ thống cập nhật FR-03
│
├── code_backend/                   # Backend API (NestJS 10)
│   ├── products.controller.ts      # Endpoints GET /products/:id, POST calculate-price
│   ├── products.controller.spec.ts # Unit tests Controller
│   ├── products.service.ts         # Logic lấy chi tiết món, options, tính giá
│   ├── products.service.spec.ts    # Unit tests Service (13/13 Passed)
│   ├── products.module.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── dto/
│   │   ├── product-detail.dto.ts   # DTO trả về chi tiết sản phẩm
│   │   └── calculate-price.dto.ts  # DTO tính toán & breakdown giá
│   └── entities/
│       ├── product.entity.ts       # Entity sản phẩm
│       └── product-option.entity.ts# Entity Size, Topping, Enums
│
├── code_frontend/                  # Frontend Next.js (App Router PWA)
│   ├── package.json
│   ├── tsconfig.json
│   ├── components/
│   │   └── ProductDetailModal.tsx  # Modal giao diện chi tiết, chọn Size/Topping, tính giá
│   ├── utils/
│   │   ├── price-calculator.ts     # Hàm tính giá động Client không độ trễ
│   │   └── price-calculator.spec.ts# Unit tests tính giá Client
│   ├── types/
│   │   └── product.ts              # Interface Typescript toàn diện
│   └── app/
│       ├── page.tsx                # Trang thực đơn tích hợp mở Modal
│       └── products/[id]/page.tsx  # Trang chi tiết độc lập theo URL ID
│
└── report/                         # Báo cáo cá nhân Thành viên 2
    ├── Assignment_report.tex       # File báo cáo LaTeX chuẩn nộp bài
    ├── report.md                   # File báo cáo Markdown xem trực quan
    ├── logoITSGU.png               # Logo Khoa CNTT SGU
    └── logoITSGUsmall.png
```
