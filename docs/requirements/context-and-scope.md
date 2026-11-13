# Báo cáo Đặc tả Bối cảnh, Các bên liên quan và Phạm vi Hệ thống (Context and Scope)

**Đồ án môn học:** Công nghệ Phần mềm (Software Engineering) – Khóa 2026–2027  
**Đơn vị:** Khoa Công nghệ Thông tin – Trường Đại học Sài Gòn (SGU)  
**Giảng viên hướng dẫn:** ThS. Từ Lãng Phiêu  
**Tên đề tài đồ án:** BrewLite – Hệ thống Đặt đồ uống & Thanh toán không tiền mặt  
**Sinh viên thực hiện:** Trần Vĩnh Thọ Lân (MSSV: 3124560049)  
**Phân công:** Phân hệ Màn hình & Luồng "Menu sản phẩm"  
**Mã tài liệu:** `REQ-DOC-01` (Task 1.1)  
**Trạng thái:** Hoàn thiện nghiệm thu Sprint 1

---

## 1. Giới thiệu và Bối cảnh nghiệp vụ (Business Context)

### 1.1. Bối cảnh thị trường F&B và thực trạng bài toán
Trong ngành dịch vụ ăn uống (F&B) hiện đại, đặc biệt là các chuỗi cà phê và đồ uống bán lẻ (coffee shop takeaway & dine-in), việc tối ưu hóa trải nghiệm khách hàng tại điểm chạm bán hàng (POS - Point of Sale) là yếu tố sống còn:
* **Vấn đề ùn tắc giờ cao điểm:** Vào các khung giờ cao điểm (sáng 07:30 – 09:00 và trưa 12:00 – 13:30), lượng khách dồn về quầy thu ngân rất đông. Mô hình gọi món truyền thống (xếp hàng chờ tới lượt $\rightarrow$ nhân viên ghi nhận thủ công $\rightarrow$ thanh toán tiền mặt $\rightarrow$ chuyển đơn vào quầy pha chế) gây ra tình trạng nghẽn cổ chai (bottleneck), thời gian chờ trung bình của một khách hàng kéo dài từ 10 đến 15 phút.
* **Sai sót trong tiếp nhận order:** Giao tiếp trực tiếp trong môi trường ồn ào dễ dẫn đến việc ghi nhận sai các tùy chỉnh phức tạp của khách (ví dụ: kích cỡ size, tỷ lệ đường/đá, danh sách topping kèm theo).
* **Rủi ro và chi phí vận hành tiền mặt:** Xử lý tiền lẻ, đối soát doanh thu cuối ngày dễ phát sinh thất thoát và gia tăng gánh nặng kiểm kê cho thu ngân.

### 1.2. Giải pháp BrewLite
**BrewLite** được thiết kế như một ứng dụng web lũy tiến (**Progressive Web App - PWA / Mobile-First Web**) chuyên biệt cho việc tự đặt hàng (**Self-Ordering**) và thanh toán không tiền mặt (**Cashless Payment**):
* Cho phép khách hàng chủ động quét mã QR tại bàn/tại cửa hàng để mở ngay Menu đồ uống trên thiết bị di động mà không cần tải app từ App Store / Google Play.
* Tự do tùy biến đồ uống (chọn Size, Topping), tính giá tự động minh bạch.
* Thanh toán điện tử tức thì (Ví điện tử, Thẻ ngân hàng), hệ thống tự sinh mã nhận đồ và cập nhật trạng thái đơn trực quan.
* Rút ngắn thời gian tương tác tại quầy từ 10–15 phút xuống dưới 2 phút.

---

## 2. Các bên liên quan (Stakeholders Analysis)

| STT | Stakeholder (Bên liên quan) | Vai trò trong hệ thống | Mục tiêu chính (Goals) | Kỳ vọng và Tiêu chí chấp nhận (Expectations & Acceptance Criteria) |
|:---:|:---|:---|:---|:---|
| **1** | **Khách hàng (Customer)** | Người dùng cuối trực tiếp duyệt menu, đặt món và thanh toán qua thiết bị cá nhân. | Đặt đồ uống nhanh chóng, không phải xếp hàng chờ quầy thu ngân; xem rõ giá tiền và thành phần tùy chỉnh. | - Giao diện trực quan, tải nhanh (< 1.5s trên mạng 4G/Wifi).<br>- Tự động tính giá khi đổi size, thêm topping.<br>- Hỗ trợ thanh toán không tiền mặt an toàn, nhận mã lấy đồ rõ ràng.<br>- Tra cứu được lịch sử đơn hàng của bản thân. |
| **2** | **Nhân viên quầy / Barista** | Nhân viên tiếp nhận danh sách order và thực hiện pha chế. | Nhận thông tin đơn hàng chính xác, rõ ràng từng chi tiết pha chế, giảm thiểu trao đổi bằng miệng. | - Danh sách món, size, topping hiển thị chuẩn xác, không bị nhầm lẫn.<br>- Trạng thái đơn chuyển đổi mạch lạc theo quy trình chuẩn: `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`. |
| **3** | **Quản lý cửa hàng / Product Owner (PO)** | Người định hướng sản phẩm, quản lý vận hành và doanh thu cửa hàng. | Tối ưu hóa năng suất phục vụ, giảm thiểu thất thoát doanh thu, theo dõi dữ liệu kinh doanh. | - Đảm bảo hệ thống vận hành ổn định, không bị nghẽn đơn.<br>- Kiểm soát chặt chẽ tồn kho nguyên vật liệu khi có nhiều khách đặt đồng thời.<br>- Quy trình bàn giao tính năng theo Sprint đúng cam kết (DoD). |
| **4** | **Giảng viên / Khách hàng nghiệm thu** | Giảng viên phụ trách học phần Công nghệ Phần mềm, đánh giá quy trình và chất lượng kỹ thuật. | Đánh giá năng lực áp dụng chuẩn công nghệ phần mềm: quy trình Agile Scrum, thiết kế UML, kiểm thử và CI/CD. | - Tuân thủ quy tắc tuần tự 5 Task của bài tập lớn.<br>- Hệ thống sơ đồ UML (Use Case, Activity, Sequence, Class, Deployment) chuẩn xác, thống nhất.<br>- Source code chuẩn monorepo (`apps/web`, `apps/api`), có automated test và CI/CD pipeline chạy thực tế.<br>- Bàn giao sản phẩm có URL Production hoạt động qua HTTPS. |
| **5** | **Nhóm phát triển (Dev Team)** | Sinh viên đảm nhận phân tích, thiết kế kiến trúc, lập trình, kiểm thử và triển khai. | Xây dựng hệ thống hoàn chỉnh theo đúng chuẩn SE, đạt điểm tối đa đồ án, mở rộng được kiến trúc. | - Phân chia công việc rõ ràng theo 5 luồng module.<br>- Kiến trúc backend/frontend phân tách lỏng (loose coupling), API RESTful chuẩn mực.<br>- Có ma trận truy vết (Traceability Matrix) từ yêu cầu đến mã nguồn và ca kiểm thử. |
| **6** | **Đơn vị thanh toán (Payment Provider / Mock Gateway)** | Đơn vị cung cấp hạ tầng thanh toán (được giả lập trong phạm vi bài tập lớn). | Đảm bảo tính toàn vẹn và an toàn của các giao dịch chuyển tiền điện tử. | - Xử lý giao dịch theo cơ chế Idempotent (Idempotency-Key) nhằm loại trừ tình trạng thanh toán trùng lặp khi người dùng bấm nhiều lần.<br>- Trả về mã giao dịch (Transaction Reference) và phản hồi trạng thái tức thời. |

---

## 3. Phạm vi đồ án (Project Scope)

### 3.1. Phạm vi cốt lõi trong MVP (In-Scope for MVP)
Toàn bộ các tính năng nằm trong luồng nghiệp vụ cốt lõi bắt buộc phục vụ quá trình nghiệm thu Sprint 1 & Sprint 2:
1. **Quản lý & Hiển thị Menu (Menu Catalog):**
   - Phân loại đồ uống theo danh mục (Cà phê truyền thống, Espresso, Trà & Matcha, Cold Brew, v.v.).
   - Lọc sản phẩm theo danh mục và tìm kiếm theo tên đồ uống.
   - Hiển thị danh sách sản phẩm trực quan (ảnh, tên, giá cơ bản, trạng thái tồn kho).
   - Xử lý trạng thái tải (Loading Skeleton), trạng thái rỗng (Empty State) và lỗi mạng (Error Fallback).
2. **Chi tiết & Tùy biến món (Product Customization):**
   - Xem chi tiết mô tả sản phẩm.
   - Chọn kích cỡ (`Size S`, `Size M`, `Size L`) kèm chênh lệch giá tương ứng.
   - Chọn thêm các loại Topping kèm đơn giá động.
   - Bộ tính toán tự động cập nhật tổng đơn giá tức thời theo tùy chọn đã chọn.
3. **Quản lý Giỏ hàng (Cart Management):**
   - Thêm món kèm đầy đủ thông số tùy biến vào giỏ hàng.
   - Xem giỏ hàng, cập nhật số lượng (+ / -), xóa từng món hoặc xóa toàn bộ.
   - Tự động tính subtotal, áp dụng mã khuyến mãi (Coupon/Voucher nếu có), tính tổng thanh toán.
4. **Xác thực người dùng (Authentication & Authorization):**
   - Đăng ký và đăng nhập tài khoản bằng email/mật khẩu.
   - Mật khẩu được mã hóa an toàn bằng thuật toán `bcrypt`.
   - Cấp phát và quản lý phiên làm việc thông qua JSON Web Token (JWT).
   - Bảo vệ các endpoint nhạy cảm (tạo đơn, thanh toán, xem lịch sử đơn cá nhân).
5. **Khởi tạo đơn hàng (Order Creation & Concurrency Control):**
   - Tạo đơn hàng mới ở trạng thái khởi đầu `PENDING`.
   - Áp dụng kỹ thuật Database Transaction kết hợp Optimistic Locking (`version` field) để kiểm soát tồn kho, ngăn chặn bán âm (overselling) khi nhiều khách cùng đặt hàng.
6. **Thanh toán không tiền mặt (Cashless Payment & Idempotency):**
   - Cung cấp cổng thanh toán giả lập hỗ trợ 2 phương thức: Ví điện tử (E-Wallet) và Thẻ ngân hàng (Bank Card).
   - Tích hợp tiêu đề `Idempotency-Key` để bảo đảm an toàn giao dịch, chống double-charge khi mạng chập chờn.
   - Chuyển trạng thái đơn sang `PAID` nếu thanh toán thành công, hoặc `PAYMENT_FAILED` nếu giao dịch thất bại.
7. **Xác nhận đơn & Lịch sử đơn hàng (Order Confirmation & History):**
   - Màn hình biên lai hiển thị mã đơn hàng dạng số (Order Number), trạng thái đơn, chi tiết các món đã đặt và tổng tiền đã trả.
   - Màn hình lịch sử đơn hàng cá nhân (`GET /orders/me`) giúp khách hàng theo dõi tiến trình đơn.
8. **Hạ tầng, CI/CD và Đóng gói triển khai:**
   - Cấu trúc monorepo phân tách `apps/web` (Next.js PWA) và `apps/api` (NestJS).
   - Container hóa hoàn chỉnh bằng Docker và Docker Compose (Web, API, PostgreSQL).
   - Pipeline GitHub Actions CI tự động kiểm tra cú pháp (Lint), kiểm thử đơn vị (Unit Test) và Build trước khi merge PR.
   - Triển khai môi trường Production có HTTPS hợp lệ.

### 3.2. Phạm vi mở rộng (Extended Scope - Post-MVP / Sprint 3)
Các tính năng nâng cao được định hướng phát triển ở các giai đoạn sau:
* **Màn hình hiển thị bếp / quầy pha chế (Kitchen Display System - KDS):** Giao diện chuyên dụng thời gian thực (WebSockets/SSE) cho Barista cập nhật trạng thái đơn `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.
* **Cổng thanh toán thực tế (Real Payment Gateway):** Tích hợp SDK cổng MoMo, ZaloPay, VNPay Sandbox/Production.
* **Thông báo Web Push / SMS:** Gửi thông báo đẩy đến điện thoại khách hàng ngay khi Barista nhấn "Đồ uống đã sẵn sàng".
* **Chương trình tích điểm hội viên sâu (Loyalty Tiering):** Phân hạng thành viên (Bạc, Vàng, Kim Cương), tự động đổi điểm sang voucher giảm giá.

### 3.3. Phạm vi không thực hiện (Out-of-Scope)
Để tập trung nguồn lực hoàn thiện chất lượng kỹ thuật cao nhất cho bài tập lớn, hệ thống **không thực hiện** các nghiệp vụ sau:
* **Thanh toán tiền mặt (Cash on Delivery / Pay at Cashier):** Hệ thống định vị 100% không dùng tiền mặt (Cashless).
* **Giao hàng tận nơi (Door-to-door Delivery):** Không tích hợp đội ngũ tài xế (shipper), bản đồ định vị GPS hay tính phí vận chuyển theo quãng đường. Hệ thống chỉ phục vụ mô hình "Đặt trước - Lấy tại quầy" (Pickup at Counter) hoặc phục vụ tại bàn.
* **Đặt bàn trước (Table Reservation):** Không quản lý sơ đồ bàn và thời gian giữ chỗ.
* **Quản trị chuỗi cung ứng chuyên sâu (Enterprise ERP):** Không bao gồm kế toán kho nhập khẩu, quản lý nhà cung cấp hạt cà phê, quản lý bảng chấm công nhân sự.

---

## 4. Các giả định và Ràng buộc (Assumptions and Constraints)

### 4.1. Giả định (Assumptions)
1. **Thiết bị người dùng:** Khách hàng sử dụng điện thoại thông minh (smartphone) có trình duyệt hiện đại (Safari, Chrome, Samsung Internet) hỗ trợ JavaScript ES6+ và HTML5 LocalStorage/PWA Service Worker.
2. **Hạ tầng mạng:** Khách hàng và hệ thống máy chủ duy trì kết nối Internet liên tục qua Wi-Fi hoặc 4G/5G với độ trễ trung bình $\le 150\text{ms}$.
3. **Mô hình thanh toán:** Do bản chất là môi trường học thuật, cổng thanh toán Ví/Thẻ được xây dựng dưới dạng dịch vụ mô phỏng (Mock Gateway) với độ trễ nhân tạo (500ms - 1000ms) để mô phỏng tương tác thực tế giữa ngân hàng và hệ thống.

### 4.2. Ràng buộc kỹ thuật & học phần (Constraints)
1. **Ràng buộc công nghệ bắt buộc theo đề bài:**
   - **Frontend:** Next.js (App Router, TypeScript, TailwindCSS, mobile-first/PWA). Không được thay thế bằng framework khác.
   - **Backend:** NestJS (TypeScript, kiến trúc phân tầng Controller - Service - Repository/Prisma, class-validator, JWT Passport).
   - **Cơ sở dữ liệu:** PostgreSQL (lưu trữ quan hệ, có persistent volume).
   - **Đóng gói:** Docker & Docker Compose.
2. **Ràng buộc quy trình và tính toàn vẹn:**
   - Phải tuân thủ tuyệt đối quy trình tuần tự 5 Task.
   - Mọi mã yêu cầu chức năng (`FR-xx`), sơ đồ (`Activity-xx`, `Class-xx`, `Sequence-xx`), mã nguồn API và kiểm thử phải được liên kết truy vết 100% trong bảng `traceability-matrix.md`.
   - Mọi thay đổi mã nguồn phải thông qua Pull Request, không commit trực tiếp vào `main`.

---

## 5. Phân tích rủi ro ban đầu và Phương án xử lý (Initial Risks & Mitigations)

| Mã rủi ro | Mô tả rủi ro (Risk Description) | Mức độ ảnh hưởng | Khả năng xảy ra | Phương án phòng ngừa & Xử lý (Mitigation Strategy) |
|:---:|:---|:---:|:---:|:---|
| **RSK-01** | **Xung đột đặt hàng đồng thời (Race Condition / Concurrency):** Nhiều khách cùng đặt một món đồ uống có tồn kho hạn chế, dẫn tới bán vượt tồn kho (overselling). | Cao | Trung bình | Áp dụng Database Transaction với cơ chế **Optimistic Locking** thông qua trường `version` trong bảng `Product`. Giao dịch nào bị xung đột version sẽ tự động rollback và báo lỗi thân thiện cho khách. |
| **RSK-02** | **Thanh toán lặp (Double Payment):** Người dùng bấm nút thanh toán nhiều lần do mạng chập chờn, dẫn đến trừ tiền 2 lần cho 1 đơn. | Rất cao | Trung bình | Bắt buộc client gửi header `Idempotency-Key` (UUIDv4) duy nhất cho mỗi phiên thanh toán. Backend kiểm tra nếu key đã tồn tại sẽ trả về kết quả đã xử lý trước đó, tuyệt đối không tạo đơn mới. |
| **RSK-03** | **Bất đồng bộ giao diện và dữ liệu thực tế:** Khách hàng duyệt menu nhưng món đó vừa hết hàng trong cơ sở dữ liệu. | Trung bình | Cao | Validate lại tồn kho tại thời điểm gọi API tạo đơn (`POST /orders`). Nếu sản phẩm đã hết hàng, trả về mã lỗi `400 Bad Request` kèm thông báo chi tiết để client cập nhật giao diện. |
| **RSK-04** | **Lỗi cấu hình môi trường deploy (Environment Drift):** Mã nguồn chạy được trên máy cục bộ (localhost) nhưng gặp lỗi khi deploy lên môi trường Production/Cloud. | Cao | Thấp | Chuẩn hóa toàn bộ môi trường thông qua `Dockerfile` multi-stage build và `docker-compose.yml`. Mọi dependencies và biến môi trường đều được khai báo qua `.env.example` và kiểm tra tự động bằng GitHub Actions CI. |

---
*Tài liệu được biên soạn phục vụ học phần Công nghệ Phần mềm – Đại học Sài Gòn (SGU).*
