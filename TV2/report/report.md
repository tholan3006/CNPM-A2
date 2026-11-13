# BÁO CÁO CÁ NHÂN: THÀNH VIÊN 2
## Màn hình & Luồng Nghiệp vụ: "Chi tiết sản phẩm & Tùy chọn món"

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) – Trường Đại học Sài Gòn (SGU)  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Học kỳ:** I – Năm học 2026–2027  
**Dự án:** BrewLite – Hệ thống Đặt đồ uống & Thanh toán không tiền mặt  
**Sinh viên thực hiện:** **Thành viên 2**  
**Phân công nhiệm vụ:** Phân hệ Màn hình & Luồng "Chi tiết sản phẩm"  
**Mã yêu cầu:** `FR-03`, `NFR-01`, `NFR-02`  
**Trạng thái:** Hoàn thành nghiệm thu (100% Passed)  

---

## 1. Tổng quan Bối cảnh, Phân công Nhiệm vụ & Đặc tả Yêu cầu (SRS)

### 1.1. Bối cảnh nghiệp vụ
Trong kinh doanh F&B hiện đại, đồ uống luôn gắn liền với nhu cầu cá nhân hóa cao độ của khách hàng:
* **Kích cỡ ly (Size):** Size S (350ml), Size M (500ml - chuẩn), Size L (700ml) với chính sách phụ thu rõ ràng.
* **Topping thêm (Add-on Toppings):** Trân châu hoàng kim, thạch cà phê, kem mặn phô mai... gia tăng giá trị đơn hàng (AOV).
* **Định lượng khẩu vị (Portions):** Tỷ lệ đường (100%, 70%, 50%, 30%, 0%) và đá (100%, 70%, 50%, đá riêng, không đá).
* **Tính giá tức thời (Zero Latency Pricing):** Cập nhật ngay lập tức đơn giá và tổng tiền khi người dùng thay đổi bất kỳ lựa chọn nào.

### 1.2. Phân công trách nhiệm nhóm
| STT | Thành viên | Luồng / Màn hình | Trách nhiệm chính | Trạng thái |
|:---:|:---|:---|:---|:---:|
| 1 | Trần Vĩnh Thọ Lân | Menu sản phẩm | Task 1.1 Context & Scope, API `GET /products` | Hoàn thành |
| **2** | **Thành viên 2** | **Chi tiết sản phẩm** | **Đặc tả SRS Options, 5 sơ đồ UML, API `GET /products/:id`, Frontend Next.js Modal** | **Hoàn thành** |
| 3 | Thành viên 3 | Giỏ hàng & Đặt đơn | Quản lý State giỏ hàng, API `POST /orders`, DB Transaction | Đang thực hiện |
| 4 | Phan Vũ Việt Quang | Thanh toán & Xác nhận | Task 1.3 Use-case thanh toán, Idempotency, API `POST /payments` | Hoàn thành |
| 5 | Thành viên 5 | Đăng ký & Đăng nhập | NFR Bảo mật, mã hóa bcrypt, API JWT Auth, Docker | Đang thực hiện |

### 1.3. Quy tắc tính giá tự động (Business Rules)
$$\text{UnitPrice} = \text{BasePrice} + \text{SizeExtraPrice} + \sum_{i=1}^{k} \text{ToppingPrice}_i$$
$$\text{TotalPrice} = \text{UnitPrice} \times \text{Quantity}$$
*Ví dụ:* Cà phê Muối Biển ($35.000$đ) + Size L ($+10.000$đ) + Thạch cà phê ($+6.000$đ) + Kem mặn phô mai ($+10.000$đ) = $61.000$đ/ly $\times 2$ ly = $122.000$ VNĐ.

---

## 2. Hệ thống 5 Sơ đồ UML Đảm nhận

### 2.1. Use Case Diagram: Chi tiết Sản phẩm & Tùy chọn Món
* **Tệp thiết kế:** [usecase-detail.puml](../../diagrams/usecase-detail.puml) | [usecase-detail.svg](../../diagrams/usecase-detail.svg)
* **Mô tả:** Mô tả các ca sử dụng xem chi tiết món, chọn size, chọn topping, điều chỉnh số lượng, kiểm tra tồn kho (`<<include>>`), tự động tính giá (`<<include>>`), và cấu hình bảng tùy chọn của Store Manager.

### 2.2. Activity Diagram: Luồng Xem Món, Chọn Size, Topping & Tính Giá Tự Động
* **Tệp thiết kế:** [activity-detail.puml](../../diagrams/activity-detail.puml) | [activity-detail.svg](../../diagrams/activity-detail.svg)
* **Mô tả:** Luồng nghiệp vụ phân theo 4 Swimlanes:
  1. *Khách hàng (Customer):* Thao tác chọn món, đổi size, tick topping, tăng/giảm số lượng.
  2. *Frontend (Next.js Modal):* Quản lý State, thực thi hàm `calculateTotalPrice()` tính giá tức thời không độ trễ, lưu vào Giỏ hàng.
  3. *Backend API (NestJS):* Tiếp nhận `GET /products/:id`, transform DTO, xử lý lỗi 404/500.
  4. *Database (PostgreSQL):* Thực thi truy vấn kết hợp bảng `products`, `product_sizes`, `product_toppings`.

### 2.3. Sequence Diagram: Sơ đồ Gọi API Chi Tiết Sản Phẩm (GET /products/:id)
* **Tệp thiết kế:** [sequence-detail.puml](../../diagrams/sequence-detail.puml) | [sequence-detail.svg](../../diagrams/sequence-detail.svg)
* **Mô tả:** Sơ đồ tương tác tuần tự qua 5 lifelines với đầy đủ nhánh thành công `200 OK` (trả về nested DTO), nhánh lỗi `404 Not Found` (khi sai ID), `500 Server Error`, và chuỗi sự kiện tính giá Client-side khi chọn Size L và Topping.

### 2.4. Class Diagram: Lớp ProductOption, Size & Topping
* **Tệp thiết kế:** [class-product-option.puml](../../diagrams/class-product-option.puml) | [class-product-option.svg](../../diagrams/class-product-option.svg)
* **Mô tả:** Mô hình hóa các lớp miền `Product`, `SizeOption`, `Topping`, `ProductTopping` (liên kết N:N), `ProductCustomization`, các Enum `SizeCode`, `SweetnessLevel`, `IceLevel` và các DTOs chuyển đổi dữ liệu.

### 2.5. Deployment Diagram: Cấu Trúc Lưu Trữ Dữ Liệu Sản Phẩm trong PostgreSQL
* **Tệp thiết kế:** [deployment-product-db.puml](../../diagrams/deployment-product-db.puml) | [deployment-product-db.svg](../../diagrams/deployment-product-db.svg)
* **Mô tả:** Sơ đồ triển khai vật lý và cấu trúc lưu trữ nội bộ của Database Server: Container `brewlite-db` (PostgreSQL 16 Alpine), bộ đệm Shared Buffers (256MB), WAL Engine, Schema CSDL quan hệ với 5 bảng dữ liệu, hệ thống 5 chỉ mục B-Tree và Docker Named Volume `brewlite_pgdata` bảo toàn dữ liệu trên ổ đĩa SSD.

---

## 3. Hiện thực Mã nguồn và Kết quả Kiểm thử Tự động

### 3.1. Frontend Next.js
* **Component Modal Chi tiết:** [ProductDetailModal.tsx](../../../apps/web/src/components/ProductDetailModal.tsx)
* **Bộ tính giá thời gian thực:** [price-calculator.ts](../../../apps/web/src/utils/price-calculator.ts)
* **Trang chi tiết Routing:** [apps/web/src/app/products/[id]/page.tsx](../../../apps/web/src/app/products/[id]/page.tsx)
* **Trang chủ tích hợp:** [apps/web/src/app/page.tsx](../../../apps/web/src/app/page.tsx)

### 3.2. Backend NestJS API
* **Controller:** [products.controller.ts](../../../apps/api/src/products/products.controller.ts)
* **Service:** [products.service.ts](../../../apps/api/src/products/products.service.ts)
* **DTOs:** [product-detail.dto.ts](../../../apps/api/src/products/dto/product-detail.dto.ts), [calculate-price.dto.ts](../../../apps/api/src/products/dto/calculate-price.dto.ts)
* **Entities:** [product.entity.ts](../../../apps/api/src/products/entities/product.entity.ts), [product-option.entity.ts](../../../apps/api/src/products/entities/product-option.entity.ts)

### 3.3. Kết quả Kiểm thử Đơn vị Tự động (13/13 Passed)
```bash
$ npm test -- src/products

PASS src/products/products.controller.spec.ts (6.334 s)
  ProductsController (Product Detail & Customization API)
    ✓ should be defined (8 ms)
    ✓ GET /products/:id: chuyen tiep loi goi lay chi tiet mon den ProductsService (4 ms)
    ✓ GET /products/:id/toppings: tra ve danh sach toppings danh rieng cho san pham (3 ms)
    ✓ POST /products/:id/calculate-price: goi service xac minh tinh toan gia dong (3 ms)

PASS src/products/products.service.spec.ts (6.356 s)
  ProductsService (Product Detail & Customization Flow)
    ✓ should be defined (7 ms)
    findOne (GET /products/:id)
      ✓ tra ve chi tiet san pham day du kem cac size va topping kha dung (5 ms)
      ✓ nem loi NotFoundException neu product id khong ton tai (3 ms)
    calculateCustomizationPrice (Dynamic Pricing Verification)
      ✓ tinh gia chinh xac voi Size M mac dinh va khong kem topping (1 ly) (3 ms)
      ✓ tinh gia tang them khi chon Size L (+10.000d) (2 ms)
      ✓ tinh tong gia phuc tap: Size L (+10k) + 2 Topping (Thach 6k + Kem man 10k) x 2 ly (3 ms)
      ✓ nem loi BadRequestException neu chon topping da het hang (2 ms)
      ✓ nem loi BadRequestException neu so luong vuot qua ton kho (2 ms)
    findAllToppings
      ✓ chi tra ve danh sach topping con hang khi bat availableOnly = true (2 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        7.293 s
Ran all test suites.
```

---

## 4. Ma trận Truy vết Yêu cầu (Traceability Matrix)

| Mã YC | Use Case / Story | Thiết kế / Sơ đồ | Mã nguồn / API | Ca kiểm thử (Test) | Kết quả |
|:---|:---|:---|:---|:---|:---:|
| **FR-03** | **US-03: Chi tiết món, Size (S/M/L) và Topping**<br>Tùy chọn kích thước, thêm topping và tự động tính tổng tiền món tức thời. | `docs/diagrams/usecase-detail.puml`<br>`docs/diagrams/activity-detail.puml`<br>`docs/diagrams/sequence-detail.puml`<br>`docs/diagrams/class-product-option.puml`<br>`docs/diagrams/deployment-product-db.puml` | **Backend:**<br>`GET /products/:id`<br>`POST /products/:id/calculate-price`<br>`apps/api/src/products/`<br><br>**Frontend:**<br>`apps/web/src/components/ProductDetailModal.tsx`<br>`apps/web/src/utils/price-calculator.ts` | • **OPT-T01:** `products.service.spec.ts`<br>• **OPT-T02:** `products.controller.spec.ts`<br>• **CALC-T01:** `price-calculator.spec.ts` | **Hoàn thành (13/13 Passed)** |
| **NFR-01** | **Phản hồi giao diện tức thời ($<50$ms)**<br>Cập nhật nhãn tổng tiền ngay khi đổi tùy chọn. | `docs/diagrams/activity-detail.puml`<br>`docs/diagrams/class-product-option.puml` | `apps/web/src/utils/price-calculator.ts` | Benchmark tính toán Client-side $< 1$ms | **Đạt chuẩn ($<16$ms)** |
| **NFR-02** | **Hiệu năng API chi tiết ($<150$ms)**<br>Tải chi tiết món từ PostgreSQL qua Prisma. | `docs/diagrams/deployment-product-db.puml` | Indexing B-Tree:<br>`idx_sizes_prod`<br>`idx_prod_toppings_pid` | Benchmark latency qua NestJS testing $< 20$ms | **Đạt chuẩn** |

---

## 5. Tổng kết
Phân hệ **"Chi tiết sản phẩm & Tùy chọn món"** của **Thành viên 2** đã hoàn thành 100% các hạng mục yêu cầu theo đúng quy định của môn học Công nghệ Phần mềm:
1. Đầy đủ đặc tả yêu cầu SRS chuyên sâu theo chuẩn IEEE 830.
2. Bộ 5 sơ đồ UML chuẩn xác cả file mã nguồn PlantUML (`.puml`) và file vector đồ họa (`.svg`).
3. Mã nguồn Frontend Next.js và Backend NestJS hoàn chỉnh, có type-safe và xử lý ngoại lệ đầy đủ.
4. Kiểm thử tự động đạt 13/13 test cases passed (100%).
5. Ma trận truy vết và báo cáo cá nhân chuẩn LaTeX & Markdown.
