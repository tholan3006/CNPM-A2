# ADR 004: Lựa chọn PostgreSQL và Prisma ORM cho Quản lý Dữ liệu

* **Trạng thái:** Chấp thuận (Accepted)
* **Ngày quyết định:** 2026-11-10
* **Người đề xuất:** Trần Vĩnh Thọ Lân & Nguyễn Hữu Chí Công
* **Bối cảnh môn học:** Đồ án Công nghệ Phần mềm (BrewLite - Assignment 2), Trường Đại học Sài Gòn

---

## 1. Bối cảnh & Vấn đề (Context)
Hệ thống đồ uống BrewLite liên quan trực tiếp đến tiền tệ, đơn hàng và kho nguyên liệu:
1. Dữ liệu có tính ràng buộc quan hệ cao: Một đơn hàng chứa nhiều món (`OrderItem`), mỗi món có thể gắn nhiều tùy chọn topping/size (`ProductOption`).
2. Yêu cầu tính toàn vẹn giao dịch (ACID): Khi tạo đơn hoặc thanh toán thành công, phải cập nhật trạng thái đơn hàng và trừ tồn kho trong cùng 1 Transaction; nếu lỗi phải rollback lập tức.
3. Yêu cầu tái tạo dữ liệu nhanh chóng qua migration và seed dữ liệu mẫu khi triển khai môi trường mới hoặc chấm bài đồ án.

## 2. Các phương án cân nhắc (Options Considered)
* **Phương án A: MongoDB + Mongoose (NoSQL):**
  * *Ưu điểm:* Dễ dàng lưu trữ giỏ hàng dưới dạng tài liệu nhúng (embedded documents).
  * *Nhược điểm:* Đề bài môn học quy định bắt buộc sử dụng PostgreSQL; quản lý giao dịch đa tài liệu (Multi-document Transaction) trong NoSQL phức tạp và tốn tài nguyên.
* **Phương án B: PostgreSQL + TypeORM:**
  * *Ưu điểm:* Hỗ trợ CSDL quan hệ tốt, cú pháp Decorator quen thuộc với NestJS.
  * *Nhược điểm:* Quản lý Migration của TypeORM thường hay bị lỗi lệch Schema; type-safety chưa thực sự đồng bộ hoàn hảo.
* **Phương án C: PostgreSQL 16 + Prisma ORM:**
  * *Ưu điểm:* Tuân thủ 100% yêu cầu đề bài; Prisma Schema định nghĩa mô hình dữ liệu tường minh; cơ chế Migration (`prisma migrate dev`) an toàn, có nhật ký thời gian; tự động sinh Prisma Client với Type-safe 100%; hỗ trợ Interactive Transactions (`prisma.$transaction`) rất mạnh mẽ.

## 3. Quyết định (Decision)
Nhóm quyết định lựa chọn **Phương án C: PostgreSQL 16 Alpine kết hợp Prisma ORM**:
* Cơ sở dữ liệu chạy trong Docker container có `persistent volume` (`postgres_data`).
* Schema được mô tả tại `apps/api/prisma/schema.prisma`.
* Tạo sẵn tệp hạt giống dữ liệu `apps/api/prisma/seed.ts` để nạp ngay lập tức 6 loại đồ uống tiêu biểu (Americano, Cà phê sữa, Cappuccino, Cold Brew, Matcha Latte, Trà đào), các loại size (S, M, L), topping và tài khoản mẫu.

## 4. Hệ quả & Đánh giá (Consequences)
* **Tích cực:** Quá trình di trú cơ sở dữ liệu diễn ra hoàn toàn tự động trong container; truy vấn an toàn chống SQL Injection; dữ liệu quan hệ được bảo vệ chặt chẽ bằng khóa ngoại `CASCADE`/`RESTRICT`.
* **Thách thức:** Cần chạy lệnh `npx prisma generate` trong bước build của CI/CD để đảm bảo Prisma Client được biên dịch trước khi test hoặc build mã nguồn.
