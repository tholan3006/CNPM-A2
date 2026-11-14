# Đặc tả Yêu cầu Phần mềm (SRS): Tính năng Tùy chọn Sản phẩm & Tính giá Tự động

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) – Trường Đại học Sài Gòn (SGU)  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Học kỳ:** I – Năm học 2026–2027  
**Dự án:** BrewLite – Hệ thống Đặt đồ uống & Thanh toán không tiền mặt  
**Thành viên phụ trách:** **Thành viên 2** (Màn hình & Luồng "Chi tiết sản phẩm")  
**Mã phân hệ:** `REQ-SRS-02` (Mã yêu cầu: **FR-03**, **NFR-01**, **NFR-02**)  
**Trạng thái:** Hoàn thành nghiệm thu Sprint 1 & Sprint 2  

---

## 1. Giới thiệu tổng quan (Introduction)

### 1.1. Mục đích tài liệu (Purpose)
Tài liệu này đặc tả chi tiết các yêu cầu chức năng (Functional Requirements - FR), yêu cầu phi chức năng (Non-Functional Requirements - NFR), quy tắc nghiệp vụ (Business Rules), mô hình dữ liệu và ca sử dụng (Use Case Specification) cho phân hệ **"Chi tiết sản phẩm & Tùy chọn món"** (Product Detail & Customization). Tài liệu là căn cứ kỹ thuật phục vụ việc thiết kế sơ đồ UML, hiện thực mã nguồn Frontend (Next.js), Backend API (NestJS), cấu trúc CSDL PostgreSQL và xây dựng kịch bản kiểm thử tự động (Unit / Integration Tests).

### 1.2. Phạm vi tính năng (Scope)
Phân hệ đảm nhiệm:
1. Hiển thị thông tin toàn diện của một sản phẩm đồ uống khi khách hàng chọn từ danh mục (ảnh, tên, mô tả chi tiết, giá gốc, trạng thái kho).
2. Cho phép người dùng tùy chọn kích cỡ ly (**Size S, Size M, Size L**) kèm biểu phí điều chỉnh tương ứng.
3. Cho phép người dùng lựa chọn thêm danh sách **Topping** (trân châu, thạch, kem cheese, pudding...) với đơn giá xác định và kiểm soát tồn kho độc lập.
4. Tùy chỉnh các thông số định lượng pha chế: **Mức đường** (100%, 70%, 50%, 30%, 0%) và **Mức đá** (100%, 70%, 50%, Đá riêng, Không đá).
5. **Thuật toán tính giá tự động thời gian thực (Real-time Dynamic Pricing Calculation):** Cập nhật ngay lập tức đơn giá món và tổng tiền tương ứng với số lượng mà không cần gửi request tải lại trang.
6. Đóng gói thông tin tùy chọn thành payload hoàn chỉnh và đưa vào Giỏ hàng (Cart State).

### 1.3. Thuật ngữ & Từ viết tắt (Definitions & Acronyms)
| Thuật ngữ | Định nghĩa |
|:---|:---|
| **Base Price** | Giá niêm yết cơ sở của sản phẩm (tương ứng kích cỡ mặc định - Size M). |
| **Size Extra Price** | Khoản chênh lệch cộng thêm (hoặc trừ bớt) khi khách chọn kích thước khác Size M. |
| **Add-on Topping** | Các thành phần đồ ăn kèm (topping) được thêm vào thức uống có tính phụ phí. |
| **Portion Options** | Tùy chọn tỷ lệ nguyên liệu không tính phí (đường, đá). |
| **Unit Price** | Đơn giá của 1 ly đồ uống sau khi đã cộng gộp chênh lệch Size và toàn bộ Topping đã chọn. |
| **Subtotal** | Tổng số tiền thanh toán của món: $\text{Subtotal} = \text{UnitPrice} \times \text{Quantity}$. |
| **PWA** | Progressive Web App – Ứng dụng web hoạt động mượt mà như app native trên thiết bị di động. |

---

## 2. Mô tả tổng quan người dùng và hành vi (Overall Description)

### 2.1. Bối cảnh luồng nghiệp vụ
```
[Trang chủ Menu] 
      │ (Nhấp vào Card đồ uống)
      ▼
[Modal Chi tiết Sản phẩm] 
      ├── 1. Xem ảnh, tên, giá cơ sở, mô tả
      ├── 2. Chọn Size (Radio: S / M / L) ───┐
      ├── 3. Chọn Topping (Checkboxes) ──────┼──► [Bộ tính giá Real-time]
      ├── 4. Chọn Đường / Đá ───────────────┤           │
      └── 5. Tăng/Giảm Số lượng (+/-) ───────┘           ▼
                                                 [Hiển thị Tổng Tiền]
                                                        │ (Bấm Thêm vào giỏ)
                                                        ▼
                                                 [Lưu vào Cart Store] ──► [Đóng Modal & Toast]
```

### 2.2. Đặc điểm người dùng mục tiêu
- Người dùng sử dụng điện thoại thông minh tại bàn hoặc quầy: Cần thao tác một tay dễ dàng, nút bấm to rõ ($\ge 44\text{px}$ theo chuẩn Apple Human Interface Guidelines).
- Mong muốn thấy giá tiền biến đổi tức thì (Zero Latency) khi click chọn món để minh bạch chi phí.

---

## 3. Quy tắc nghiệp vụ cốt lõi (Business Rules)

* **BR-01 (Mặc định Size):** Mỗi sản phẩm đồ uống khi mở lên luôn có một kích cỡ mặc định được chọn sẵn là **Size M** (phụ thu $0$ VNĐ). Khách hàng có thể chuyển sang Size S (phụ thu $-5.000$ VNĐ hoặc $0$ VNĐ tùy món) hoặc Size L (phụ thu $+10.000$ VNĐ).
* **BR-02 (Quy tắc chọn Topping):** 
  - Khách hàng được phép chọn từ $0$ đến tối đa $5$ loại topping cho một ly đồ uống.
  - Mỗi loại topping chỉ được chọn một lần cho một ly (dạng checkbox bật/tắt).
  - Không cho phép chọn các topping có trạng thái tồn kho $\text{stock} = 0$ hoặc $\text{isAvailable} = \text{false}$ (hiển thị mờ và vô hiệu hóa tương tác).
* **BR-03 (Công thức tính giá tự động):**
  $$\text{Đơn giá 1 ly (UnitPrice)} = \text{BasePrice} + \text{SizeExtraPrice} + \sum_{i=1}^{k} \text{ToppingPrice}_i$$
  $$\text{Tổng tiền (TotalPrice)} = \text{UnitPrice} \times \text{Quantity}$$
  *Ví dụ:* Cà phê Muối Biển giá cơ sở $35.000$đ; chọn Size L ($+10.000$đ); chọn thêm Thạch cà phê ($+6.000$đ) và Kem mặn phô mai ($+10.000$đ); Số lượng: $2$ ly.  
  $\text{UnitPrice} = 35.000 + 10.000 + 6.000 + 10.000 = 61.000$ VNĐ.  
  $\text{TotalPrice} = 61.000 \times 2 = 122.000$ VNĐ.
* **BR-04 (Giới hạn số lượng đặt):** Số lượng món cho một lần thêm vào giỏ tối thiểu là $1$ và không được vượt quá số lượng tồn kho còn lại của sản phẩm ($\text{stock}$) và không vượt quá $50$ ly/món.
* **BR-05 (Tính phân biệt trong giỏ hàng):** Hai món cùng một `productId` nhưng khác nhau về Size hoặc danh sách Topping hoặc mức Đường/Đá sẽ được lưu thành **hai mục riêng biệt (distinct line items)** trong Giỏ hàng. Nếu trùng khớp toàn bộ tùy chọn, hệ thống sẽ gộp số lượng (`quantity = quantity + newQuantity`).

---

## 4. Yêu cầu chức năng chi tiết (Functional Requirements)

### 4.1. FR-03.1: Hiển thị chi tiết thông tin sản phẩm
* **Mô tả:** Khi khách hàng nhấp vào thẻ món trên thực đơn, hệ thống hiển thị Modal chi tiết nạp thông tin từ API `GET /products/:id`.
* **Dữ liệu hiển thị:**
  - Ảnh đại diện chất lượng cao (tối ưu WebP, có placeholder fallback).
  - Tên đầy đủ của thức uống.
  - Giá cơ sở (Base Price) định dạng chuẩn tiền tệ Việt Nam (VNĐ).
  - Mô tả thành phần, hương vị của đồ uống.
  - Nhãn trạng thái kho (Còn hàng / Sắp hết / Đang tạm hết).

### 4.2. FR-03.2: Chọn Kích cỡ Đồ uống (Size Selection)
* **Mô tả:** Cung cấp nhóm nút chọn 1 giá trị duy nhất (Single Choice / Radio Buttons) gồm 3 lựa chọn:
  - **Size S (Nhỏ):** extraPrice (thường là $0$đ hoặc $-5.000$đ).
  - **Size M (Vừa - Mặc định):** extraPrice $= 0$đ.
  - **Size L (Lớn):** extraPrice $= +10.000$đ.
* **Hành vi:** Khi người dùng chọn size khác, giá trị phụ thu hiển thị rõ trên nhãn nút (vd: `Size L (+10.000đ)`), giao diện highlight lựa chọn đang active.

### 4.3. FR-03.3: Chọn Topping kèm theo (Add-on Toppings Selection)
* **Mô tả:** Cung cấp danh sách các loại Topping kèm đơn giá và checkbox chọn nhiều (Multiple Choice):
  - Trân châu hoàng kim ($+6.000$đ).
  - Thạch cà phê ($+6.000$đ).
  - Kem mặn phô mai ($+10.000$đ).
  - Sốt caramel macchiato ($+8.000$đ).
  - Hạt sen tươi ngâm đường ($+12.000$đ).
* **Ràng buộc:** Topping hết hàng hiển thị huy hiệu `Hết hàng` và không cho phép click chọn.

### 4.4. FR-03.4: Tùy chọn Mức Đường & Mức Đá
* **Mô tả:** Cung cấp các nút bấm nhanh (Pill Buttons) để khách hàng chọn khẩu vị:
  - **Đường:** `100% (Chuẩn)`, `70%`, `50%`, `30%`, `Không đường (0%)`.
  - **Đá:** `100% (Chuẩn)`, `70%`, `50%`, `Đá riêng`, `Không đá (0%)`.
* **Biểu phí:** Không tính thêm phụ phí cho tùy chọn định lượng này.

### 4.5. FR-03.5: Bộ tính toán giá tiền tự động (Dynamic Price Calculation)
* **Mô tả:** Hệ thống thực thi hàm tính toán Client-side `calculateTotalPrice()` mỗi khi có bất kỳ sự kiện thay đổi State nào (`selectedSize`, `selectedToppings`, `quantity`).
* **Thời gian phản hồi:** Dưới $16$ms (đạt chuẩn 60 FPS, cập nhật lập tức trong cùng chu kỳ render của React).
* **Hiển thị:** Cập nhật trực tiếp số tiền hiển thị nổi bật trên nút hành động chính (Call To Action - CTA):  
  `Thêm vào giỏ hàng • [Tổng tiền đã tính] VNĐ`.

### 4.6. FR-03.6: Điều chỉnh số lượng và Thêm vào giỏ hàng
* **Mô tả:** 
  - Nút `[-]` giảm số lượng (tối thiểu là 1).
  - Nút `[+]` tăng số lượng (tối đa theo tồn kho).
  - Khi bấm nút "Thêm vào giỏ hàng", hệ thống kiểm tra tính hợp lệ, sinh mã băm hoặc UUID cho line item, dispatch action vào `cartStore`, hiển thị Toast thông báo thành công và đóng modal.

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements)

* **NFR-01 (Hiệu năng phản hồi giao diện):**
  - Thời gian phản hồi giao diện khi người dùng chuyển đổi Size hoặc bấm chọn Topping phải dưới $50$ms.
  - Hiệu ứng mở Modal mượt mà với animation CSS Hardware-Accelerated (transform / opacity).
* **NFR-02 (Thời gian phản hồi API GET /products/:id):**
  - Endpoint `GET /products/:id` có độ trễ phản hồi (P95 latency) $< 150$ms khi tải từ CSDL PostgreSQL thông qua Prisma ORM.
  - Bảng `product_sizes` và `product_toppings` được lập chỉ mục (B-Tree Index) trên cột `product_id`.
* **NFR-03 (Tính toàn vẹn tài chính & Làm tròn số):**
  - Tất cả các phép tính giá được thực hiện ở đơn vị số nguyên VNĐ, không làm phát sinh số thập phân lẻ.
  - Phía Backend khi tạo đơn hàng sẽ thực hiện tính toán độc lập để xác minh lại giá tiền do Client gửi lên, phòng chống can thiệp giá từ DevTools.
* **NFR-04 (Tính tương thích & Responsive):**
  - Giao diện Modal tương thích hoàn hảo trên các độ phân giải màn hình từ mobile ($320\text{px}$) đến máy tính để bàn ($1920\text{px}$).
  - Trên mobile, Modal hoạt động như một Bottom Sheet vuốt kéo tiện dụng.

---

## 6. Đặc tả Ca sử dụng chi tiết (Use Case Specification)

| Mục | Nội dung chi tiết |
|:---|:---|
| **Mã Use Case** | **UC-DET-01: Xem chi tiết sản phẩm và chọn tùy chọn** |
| **Tác nhân (Actor)** | Khách hàng (Customer) |
| **Mô tả tóm tắt** | Khách hàng mở modal chi tiết của một thức uống, chọn kích thước ly, thêm các loại topping yêu thích, chọn tỷ lệ đá/đường, quan sát tổng tiền tự động cập nhật và nhấn thêm vào giỏ hàng. |
| **Kích hoạt (Trigger)** | Khách hàng bấm vào Thẻ sản phẩm (Product Card) trên màn hình Thực đơn. |
| **Tiền điều kiện** | 1. Ứng dụng PWA đang chạy và kết nối mạng hoạt động.<br>2. Sản phẩm có trạng thái `isActive = true`. |
| **Hậu điều kiện** | 1. Mặt hàng kèm đầy đủ thông tin kích cỡ, danh sách topping, số lượng và tổng tiền được lưu thành công vào Giỏ hàng.<br>2. Biểu tượng Giỏ hàng trên thanh tiêu đề cập nhật số lượng badge.<br>3. Modal chi tiết đóng lại, giao diện quay về vị trí thực đơn trước đó. |
| **Luồng chính (Happy Path)** | 1. Khách hàng nhấp vào món đồ uống.<br>2. Modal mở lên ở trạng thái Skeleton Loader.<br>3. Frontend gọi `GET /products/:id` tới Backend API.<br>4. Backend truy vấn CSDL PostgreSQL và trả về HTTP 200 OK kèm thông tin món, danh sách size khả dụng và danh sách topping.<br>5. Frontend render modal chi tiết với giá trị mặc định (Size M, 0 topping, 100% đường, 100% đá, số lượng 1).<br>6. Khách hàng chọn Size L (+10.000đ).<br>7. Hệ thống tự động tính lại đơn giá và hiển thị số tiền mới.<br>8. Khách hàng tick chọn 2 loại topping: Thạch cà phê (+6.000đ) và Kem mặn (+10.000đ).<br>9. Hệ thống tự động cộng dồn và cập nhật giá tức thời.<br>10. Khách hàng tăng số lượng lên 2.<br>11. Hệ thống tính tổng = Đơn giá × 2 và cập nhật nhãn nút CTA.<br>12. Khách hàng nhấn "Thêm vào giỏ hàng".<br>13. Frontend lưu item vào giỏ hàng, hiển thị thông báo Toast thành công và đóng modal. |
| **Luồng rẽ nhánh (Alternative Flows)** | **Alt-1: Khách hàng giữ nguyên tùy chọn mặc định:** Bỏ qua các bước chọn size/topping, bấm trực tiếp "Thêm vào giỏ hàng" với giá gốc.<br>**Alt-2: Khách hàng đổi ý đóng Modal:** Khách bấm biểu tượng [X] hoặc bấm ra ngoài nền mờ để đóng modal mà không thêm món vào giỏ. |
| **Luồng ngoại lệ (Exceptions)** | **Exc-1: Sản phẩm không tìm thấy (HTTP 404):** Backend phản hồi lỗi 404; Frontend hiển thị thông báo lỗi "Sản phẩm hiện không khả dụng" và tự động đóng modal sau 2 giây.<br>**Exc-2: Topping tạm hết hàng:** Checkbox của topping bị khóa `disabled`, hiển thị chữ "Hết hàng", người dùng không thể chọn topping này.<br>**Exc-3: Mất kết nối mạng (Network Error):** Frontend hiển thị nút "Thử lại" ngay trong modal. |

---

## 7. Bảng từ điển dữ liệu (Data Dictionary)

### 7.1. Bảng thực thể CSDL PostgreSQL
```sql
-- Bảng danh mục đồ uống
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm đồ uống
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    description TEXT,
    image_url VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng kích cỡ món
CREATE TABLE product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_code VARCHAR(10) NOT NULL, -- 'S', 'M', 'L'
    name VARCHAR(50) NOT NULL,      -- 'Nhỏ (Size S)', 'Vừa (Size M)', 'Lớn (Size L)'
    extra_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    CONSTRAINT uq_product_size UNIQUE (product_id, size_code)
);

-- Bảng topping
CREATE TABLE toppings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 50 CHECK (stock >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng liên kết N:N giữa Sản phẩm và Topping khả dụng
CREATE TABLE product_toppings (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    topping_id UUID NOT NULL REFERENCES toppings(id) ON DELETE RESTRICT,
    is_default BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (product_id, topping_id)
);

-- Chỉ mục B-Tree tối ưu truy vấn
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_toppings_active ON toppings(is_active);
CREATE INDEX idx_prod_toppings_pid ON product_toppings(product_id);
```

### 7.2. Đặc tả Cấu trúc DTO (NestJS API Contract)
* **Response DTO:** `GET /products/:id`
```json
{
  "id": "c1f7a8b4-92e1-4b72-9a05-132d0c2e7421",
  "name": "Cà phê Muối Biển",
  "description": "Cà phê pha phin truyền thống kết hợp lớp kem mặn phô mai béo ngậy đặc trưng.",
  "basePrice": 35000,
  "imageUrl": "/images/salt-coffee.webp",
  "stock": 85,
  "category": {
    "id": "e4b11f32-7212-4c22-b251-512128763214",
    "name": "Cà phê Đặc Biệt",
    "slug": "ca-phe-dac-biet"
  },
  "sizes": [
    {
      "id": "s-01",
      "code": "S",
      "name": "Nhỏ (Size S)",
      "extraPrice": -5000,
      "isDefault": false,
      "isAvailable": true
    },
    {
      "id": "s-02",
      "code": "M",
      "name": "Vừa (Size M - Chuẩn)",
      "extraPrice": 0,
      "isDefault": true,
      "isAvailable": true
    },
    {
      "id": "s-03",
      "code": "L",
      "name": "Lớn (Size L)",
      "extraPrice": 10000,
      "isDefault": false,
      "isAvailable": true
    }
  ],
  "toppings": [
    {
      "id": "top-01",
      "name": "Thạch cà phê giòn",
      "price": 6000,
      "stock": 40,
      "isAvailable": true
    },
    {
      "id": "top-02",
      "name": "Kem mặn phô mai",
      "price": 10000,
      "stock": 25,
      "isAvailable": true
    },
    {
      "id": "top-03",
      "name": "Trân châu hoàng kim",
      "price": 8000,
      "stock": 0,
      "isAvailable": false
    }
  ]
}
```

---

## 8. Kết luận
Tài liệu SRS này đã chuẩn hóa đầy đủ các yêu cầu cho tính năng tùy chọn sản phẩm và tính giá tiền tự động. Mọi trường thông tin, quy tắc tính toán và luồng sự kiện được thiết kế đồng bộ với hệ thống 5 sơ đồ UML và sẵn sàng cho việc kiểm thử tự động đạt độ tin cậy tuyệt đối.
