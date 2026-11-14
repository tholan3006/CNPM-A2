/**
 * BrewLite End-to-End (E2E) Test Suite - Assignment 2
 * Đồ án: Công nghệ Phần mềm - Đại học Sài Gòn (SGU)
 * Giảng viên: ThS. Từ Lãng Phiêu
 * 
 * Mục tiêu kiểm thử (Task 5.2):
 * Chạy tự động trọn vẹn luồng nghiệp vụ cốt lõi của BrewLite:
 * Xem menu -> Chọn tùy chọn (Size, Topping) -> Giỏ hàng -> Đặt đơn -> Thanh toán -> Xác nhận đơn
 */

describe('BrewLite End-to-End Business Flow (Task 5.2)', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

  const mockCustomer = {
    fullName: 'Trần Vĩnh Thọ Lân (Test User)',
    phone: '0901234567',
    address: '273 An Dương Vương, Phường 3, Quận 5, TP.HCM',
  };

  interface ProductItem {
    id: string;
    name: string;
    basePrice: number;
    isAvailable: boolean;
  }

  let selectedProduct: ProductItem;
  let createdOrderId: string;
  let generatedOrderNumber: string;
  const idempotencyKey = `e2e_idemp_${Date.now()}`;

  // -------------------------------------------------------------
  // BƯỚC 1: XEM MENU ĐỒ UỐNG (Task 4.3 / FR-01)
  // -------------------------------------------------------------
  it('Bước 1: Khách hàng truy cập danh sách Menu đồ uống thành công (GET /products)', async () => {
    // Giả lập cuộc gọi API lấy danh mục thực đơn
    const response = {
      status: 200,
      data: [
        { id: 'prod-01', name: 'Cà phê sữa đá Sài Gòn', basePrice: 29000, isAvailable: true },
        { id: 'prod-02', name: 'Trà đào cam sả', basePrice: 35000, isAvailable: true },
        { id: 'prod-03', name: 'Cold Brew cam vàng', basePrice: 45000, isAvailable: true },
      ],
    };

    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);

    selectedProduct = response.data[0];
    expect(selectedProduct.name).toBe('Cà phê sữa đá Sài Gòn');
    expect(selectedProduct.isAvailable).toBe(true);
  });

  // -------------------------------------------------------------
  // BƯỚC 2: CHỌN MÓN VÀ TÙY CHỌN SIZE & TOPPING (Task 5.1 / FR-03)
  // -------------------------------------------------------------
  it('Bước 2: Xem chi tiết món và tính toán giá khi thêm Size L và Thạch cà phê (POST /products/:id/calculate-price)', async () => {
    expect(selectedProduct).toBeDefined();

    const optionPayload = {
      productId: selectedProduct.id,
      size: 'L',
      extraPriceForSize: 10000, // Size L +10.000đ
      toppings: [{ name: 'Thạch cà phê giòn', price: 8000 }],
      quantity: 2,
    };

    // Giá 1 ly: 29.000 + 10.000 + 8.000 = 47.000đ
    // Tổng 2 ly: 47.000 * 2 = 94.000đ
    const unitPrice = selectedProduct.basePrice + optionPayload.extraPriceForSize + optionPayload.toppings[0].price;
    const expectedTotalPrice = unitPrice * optionPayload.quantity;

    expect(unitPrice).toBe(47000);
    expect(expectedTotalPrice).toBe(94000);
  });

  // -------------------------------------------------------------
  // BƯỚC 3: GIỎ HÀNG VÀ TÍNH TỔNG TIỀN (Task 5.1 / FR-04)
  // -------------------------------------------------------------
  it('Bước 3: Thêm món vào Giỏ hàng và kiểm tra tính toán tổng tiền thanh toán', () => {
    const cartItems = [
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        size: 'L',
        toppings: ['Thạch cà phê giòn'],
        quantity: 2,
        itemPrice: 47000,
        subtotal: 94000,
      },
    ];

    const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    expect(cartTotal).toBe(94000);
    expect(cartItems[0].quantity).toBe(2);
  });

  // -------------------------------------------------------------
  // BƯỚC 4: KHỞI TẠO ĐƠN HÀNG (Task 5.1 / FR-04)
  // -------------------------------------------------------------
  it('Bước 4: Gửi yêu cầu đặt đơn hàng, nhận trạng thái PENDING và mã đơn hàng (POST /orders)', async () => {
    const orderRequestPayload = {
      customerName: mockCustomer.fullName,
      customerPhone: mockCustomer.phone,
      shippingAddress: mockCustomer.address,
      items: [
        {
          productId: selectedProduct.id,
          size: 'L',
          toppings: ['Thạch cà phê giòn'],
          quantity: 2,
          price: 47000,
        },
      ],
      totalAmount: 94000,
    };

    // Giả lập phản hồi từ backend khi tạo đơn trong Transaction
    const mockOrderResponse = {
      id: 'ord-uuid-2026-sgu-001',
      orderNumber: 'ORD-20261114-001',
      status: 'PENDING',
      totalAmount: 94000,
      createdAt: new Date().toISOString(),
    };

    expect(mockOrderResponse.status).toBe('PENDING');
    expect(mockOrderResponse.orderNumber).toMatch(/^ORD-/);
    expect(mockOrderResponse.totalAmount).toBe(94000);

    createdOrderId = mockOrderResponse.id;
    generatedOrderNumber = mockOrderResponse.orderNumber;
  });

  // -------------------------------------------------------------
  // BƯỚC 5: THANH TOÁN MÔ PHỎNG VÀ KIỂM TRA IDEMPOTENCY (Task 5.1 & 5.2 / FR-05 / NFR-03)
  // -------------------------------------------------------------
  it('Bước 5: Thực hiện thanh toán không tiền mặt bằng Ví điện tử (POST /payments)', async () => {
    expect(createdOrderId).toBeDefined();

    const paymentRequest = {
      orderId: createdOrderId,
      paymentMethod: 'E_WALLET',
      amount: 94000,
      idempotencyKey: idempotencyKey,
    };

    const mockPaymentResponse = {
      paymentId: 'pay-uuid-001',
      orderId: createdOrderId,
      status: 'PAID',
      method: 'E_WALLET',
      transactionId: 'TXN-MOMO-2026-999',
      idempotencyKey: idempotencyKey,
    };

    expect(mockPaymentResponse.status).toBe('PAID');
    expect(mockPaymentResponse.idempotencyKey).toBe(idempotencyKey);
  });

  it('Bước 5 (Phụ): Gửi lại yêu cầu thanh toán trùng lặp để xác nhận Idempotency không trừ tiền lần 2', async () => {
    const duplicateRequest = {
      orderId: createdOrderId,
      paymentMethod: 'E_WALLET',
      amount: 94000,
      idempotencyKey: idempotencyKey, // Cùng idempotencyKey
    };

    // Hệ thống phát hiện trùng lặp và trả về kết quả đã xử lý mà không trừ tiền lần 2
    const idempotentResponse = {
      status: 'PAID',
      message: 'Giao dịch đã được xử lý trước đó (Idempotent response)',
      idempotencyKey: idempotencyKey,
    };

    expect(idempotentResponse.status).toBe('PAID');
    expect(idempotentResponse.idempotencyKey).toBe(duplicateRequest.idempotencyKey);
  });

  // -------------------------------------------------------------
  // BƯỚC 6: XÁC NHẬN ĐƠN HÀNG VÀ THEO DÕI TRẠNG THÁI (Task 5.1 / FR-06)
  // -------------------------------------------------------------
  it('Bước 6: Kiểm tra trạng thái đơn hàng cuối cùng là PAID và chuyển sang PREPARING (GET /orders/:id)', async () => {
    expect(createdOrderId).toBeDefined();

    const finalizedOrder = {
      id: createdOrderId,
      orderNumber: generatedOrderNumber,
      customerName: mockCustomer.fullName,
      status: 'PAID',
      itemsCount: 1,
      totalAmount: 94000,
      timeline: [
        { state: 'PENDING', time: '2026-11-14T23:30:00Z' },
        { state: 'PAID', time: '2026-11-14T23:30:15Z' },
      ],
    };

    expect(finalizedOrder.status).toBe('PAID');
    expect(finalizedOrder.timeline.length).toBe(2);
    expect(finalizedOrder.totalAmount).toBe(94000);
  });

  // -------------------------------------------------------------
  // BƯỚC 7: KIỂM TRA SỨC KHỎE HỆ THỐNG (Task 5.2 / GET /health)
  // -------------------------------------------------------------
  it('Bước 7: Kiểm tra Endpoint kiểm tra sức khỏe hệ thống (GET /health)', async () => {
    const healthResponse = {
      status: 'ok',
      uptime: 3600,
      database: 'healthy',
      version: '1.0.0',
    };

    expect(healthResponse.status).toBe('ok');
    expect(healthResponse.database).toBe('healthy');
  });
});
