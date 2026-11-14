import { calculateTotalPrice, formatVND } from './price-calculator';
import { SizeCode } from '../types/product';

describe('Price Calculator (Frontend Client-side)', () => {
  const mockProduct = {
    basePrice: 35000,
    sizes: [
      { id: 's-01', code: 'S' as SizeCode, name: 'Size S', extraPrice: -5000, isDefault: false, isAvailable: true },
      { id: 's-02', code: 'M' as SizeCode, name: 'Size M', extraPrice: 0, isDefault: true, isAvailable: true },
      { id: 's-03', code: 'L' as SizeCode, name: 'Size L', extraPrice: 10000, isDefault: false, isAvailable: true },
    ],
    toppings: [
      { id: 'top-01', name: 'Thạch cà phê', price: 6000, stock: 40, isAvailable: true },
      { id: 'top-02', name: 'Kem phô mai', price: 10000, stock: 20, isAvailable: true },
      { id: 'top-03', name: 'Trân châu hết hàng', price: 8000, stock: 0, isAvailable: false },
    ],
  };

  it('tinh gia mac dinh cho Size M va khong topping', () => {
    const result = calculateTotalPrice(mockProduct, 'M', [], 1);
    expect(result.unitPrice).toBe(35000);
    expect(result.totalPrice).toBe(35000);
    expect(result.sizeExtraPrice).toBe(0);
    expect(result.toppingsTotal).toBe(0);
  });

  it('tinh gia cho Size S giam 5.000d', () => {
    const result = calculateTotalPrice(mockProduct, 'S', [], 1);
    expect(result.unitPrice).toBe(30000);
    expect(result.totalPrice).toBe(30000);
  });

  it('tinh gia cho Size L tang 10.000d', () => {
    const result = calculateTotalPrice(mockProduct, 'L', [], 1);
    expect(result.unitPrice).toBe(45000);
    expect(result.totalPrice).toBe(45000);
  });

  it('tinh gia voi topping va so luong nhieu ly', () => {
    // Size L (45k) + Thach (6k) + Kem (10k) = 61k/ly * 3 ly = 183.000d
    const result = calculateTotalPrice(mockProduct, 'L', ['top-01', 'top-02'], 3);
    expect(result.sizeExtraPrice).toBe(10000);
    expect(result.toppingsTotal).toBe(16000);
    expect(result.unitPrice).toBe(61000);
    expect(result.quantity).toBe(3);
    expect(result.totalPrice).toBe(183000);
  });

  it('bo qua topping khong kha dung hoac het hang', () => {
    // top-03 is out of stock (stock: 0) -> should be ignored (0d)
    const result = calculateTotalPrice(mockProduct, 'M', ['top-03'], 1);
    expect(result.toppingsTotal).toBe(0);
    expect(result.totalPrice).toBe(35000);
  });

  it('dinh dang tien VND chuan', () => {
    expect(formatVND(35000)).toContain('35.000');
  });
});
