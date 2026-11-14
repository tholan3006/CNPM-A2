# Bộ Kiểm thử Tích hợp & Đầu-cuối BrewLite (E2E & Integration Tests)

**Đồ án:** Công nghệ Phần mềm -- Trường Đại học Sài Gòn  
**Nhiệm vụ:** Task 5.2 - Tích hợp và kiểm thử hệ thống  

---

## 1. Mục tiêu Kiểm thử (Test Objective)
Đề bài yêu cầu:
> "Viết ít nhất 1 bài End-to-End (E2E) test tự động chạy từ lúc xem menu đến khi xác nhận đơn."

Tệp `tests/e2e-order-flow.spec.ts` hiện thực kịch bản kiểm thử tự động toàn diện gồm 7 bước liên hoàn:
1. **Bước 1 (FR-01):** Khách hàng duyệt Menu đồ uống (`GET /products`), kiểm tra danh sách có món sẵn sàng phục vụ.
2. **Bước 2 (FR-03):** Chọn chi tiết món, tùy biến kích cỡ Size (S/M/L) và topping, tính toán tổng giá món tức thì (`POST /products/:id/calculate-price`).
3. **Bước 3 (FR-04):** Quản lý giỏ hàng, cập nhật số lượng món và tính tổng tiền giỏ hàng.
4. **Bước 4 (FR-04):** Khởi tạo đơn hàng (`POST /orders`), nhận mã định danh `#ORD-XXXXXX` với trạng thái ban đầu là `PENDING`.
5. **Bước 5 (FR-05 & NFR-03):** Thực hiện thanh toán không tiền mặt (`POST /payments`), xác thực Idempotency chống trừ tiền 2 lần khi mạng retry.
6. **Bước 6 (FR-06):** Xác nhận đơn hàng thành công, chuyển đổi trạng thái sang `PAID` và cập nhật lịch sử đơn.
7. **Bước 7 (Task 5.2):** Kiểm tra sức khỏe toàn hệ thống qua endpoint `GET /health`.

---

## 2. Hướng dẫn Chạy Kiểm thử Cục bộ

### Chạy trực tiếp qua Jest:
```powershell
# Chạy toàn bộ kịch bản E2E Test
npx jest tests/e2e-order-flow.spec.ts --verbose
```

### Chạy trọn gói kiểm thử Backend API:
```powershell
cd apps/api
npm test
```
