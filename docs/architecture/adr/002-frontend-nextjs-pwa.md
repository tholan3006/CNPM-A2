# ADR 002: Lựa chọn Next.js App Router và Mobile-First PWA

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Trần Vĩnh Thọ Lân & Nguyễn Tuấn Khôi
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Khách hàng của BrewLite chủ yếu là sinh viên, nhân viên văn phòng và khách mua đồ uống trực tiếp tại quán hoặc đặt trước khi đến. Họ sử dụng điện thoại thông minh (smartphone) với kích thước màn hình phổ biến từ 375px đến 430px, yêu cầu tốc độ tải menu tức thời ($<500$ms) và trải nghiệm đặt món mượt mà như ứng dụng gốc (Native App) mà không cần bắt buộc cài đặt qua App Store / Google Play.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: Single Page Application thuần (Vite + React SPA):**
  * *Ưu điểm:* Đơn giản, nhẹ, dễ cấu hình ban đầu.
  * *Nhược điểm:* Tốc độ tải lần đầu chậm do phải nạp toàn bộ bundle JavaScript lớn; không tối ưu SEO; việc cấu hình Server-Side Rendering hoặc caching tĩnh phức tạp.
* **Phương án B: Next.js 14 (App Router) theo kiến trúc Mobile-First PWA:**
  * *Ưu điểm:* Hỗ trợ Server-Side Rendering (SSR) và Incremental Static Regeneration (ISR) giúp tải menu tức thì; tích hợp Tailwind CSS giúp responsive mượt mà; hỗ trợ Service Worker biến trang web thành Progressive Web App (PWA) có thể "Add to Home Screen".
  * *Nhược điểm:* Đòi hỏi hiểu rõ cơ chế phân biệt giữa Server Component và Client Component (`'use client'`).

## 3. Quyết định (Decision)
Nhóm lựa chọn **Phương án B: Next.js 14 App Router + Tailwind CSS + PWA**, tổ chức theo triết lý **Mobile-First**:
* Ưu tiên bố cục giao diện hiển thị tối ưu trên khung nhìn di động (375px - 430px).
* Sử dụng **Zustand** lưu trữ giỏ hàng ở Client, kết hợp `localStorage` để duy trì dữ liệu khi mất kết nối mạng.
* Thiết lập Service Worker và tệp `manifest.json` cho phép lưu trữ ngoại tuyến và biểu tượng PWA trên màn hình chính.

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Tốc độ tải menu đáp ứng xuất sắc tiêu chí NFR-01 ($<500$ms); giao diện trực quan, thao tác một chạm trên điện thoại rất thuận tiện.
* **Thách thức:** Cần quản lý việc nạp ảnh món ăn tối ưu (sử dụng component `next/image` có `priority` cho các món nổi bật) để giảm thiểu Layout Shift.
