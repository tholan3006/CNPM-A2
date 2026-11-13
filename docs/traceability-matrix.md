# Ma trận truy vết yêu cầu (Traceability Matrix - Phan Vũ Việt Quang / viet_quang)

| Mã yêu cầu | Use-case / User Story | Thiết kế / Sơ đồ | Mã nguồn / API | Ca kiểm thử (Test Cases) |
| :--- | :--- | :--- | :--- | :--- |
| **FR-05** | **UC-01: Đặt và thanh toán đơn hàng** | `sequence-payment.puml`<br>`class-payment.puml`<br>`activity-payment.puml` | `backend/src/payments/payments.controller.ts`<br>`backend/src/orders/payment-processor.service.ts` | **PAY-T01**: Unit test xử lý Idempotency không gọi cổng trừ tiền lần 2<br>**PAY-T02**: Integration test API `POST /payments` |
| **FR-06** | **UC-01.5: Xác nhận đơn và trạng thái PAID** | `activity-payment.puml`<br>`deployment-payment.puml` | `frontend/src/app/order-success/page.tsx`<br>`frontend/src/components/OrderSuccessModal.tsx` | **CONF-T01**: Component test hiển thị mã đơn `#ORD-XXXXXX` và badge `PAID` |
| **FR-07** | **UC-01.6: Xử lý lỗi thanh toán & Thử lại** | `activity-payment.puml`<br>`sequence-payment.puml` | `frontend/src/app/checkout/page.tsx`<br>`backend/src/orders/order-lifecycle.service.ts` | **RETRY-T01**: Test bảo toàn trạng thái giỏ hàng khi nhận trạng thái `PAYMENT_FAILED` |
| **NFR-03** | Tính Idempotency & Bảo mật | `sequence-payment.puml`<br>`deployment-payment.puml` | `prisma/schema.prisma` (cột `idempotencyKey @unique`)<br>`backend/src/auth/guards/jwt-auth.guard.ts` | **SEC-T01**: Test chặn thanh toán khi thiếu JWT Token hoặc trùng lặp Request |
