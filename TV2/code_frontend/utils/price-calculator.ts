import { ProductDetail, SizeCode, PriceCalculationResult } from '../types/product';

export function calculateTotalPrice(
  product: Pick<ProductDetail, 'basePrice' | 'sizes' | 'toppings'>,
  selectedSizeCode: SizeCode,
  selectedToppingIds: string[],
  quantity: number = 1,
): PriceCalculationResult {
  // 1. Locate selected size extra price
  const selectedSize = product.sizes.find((s) => s.code === selectedSizeCode);
  const sizeExtraPrice = selectedSize ? selectedSize.extraPrice : 0;

  // 2. Sum up selected toppings price
  const toppingsTotal = selectedToppingIds.reduce((sum, toppingId) => {
    const topping = product.toppings.find((t) => t.id === toppingId);
    if (topping && topping.isAvailable && topping.stock > 0) {
      return sum + topping.price;
    }
    return sum;
  }, 0);

  // 3. Unit Price & Total
  const unitPrice = product.basePrice + sizeExtraPrice + toppingsTotal;
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));
  const totalPrice = unitPrice * safeQuantity;

  return {
    basePrice: product.basePrice,
    sizeExtraPrice,
    toppingsTotal,
    unitPrice,
    quantity: safeQuantity,
    totalPrice,
    formattedTotal: formatVND(totalPrice),
  };
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(amount)
    .replace('₫', 'đ');
}
