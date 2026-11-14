export type SizeCode = 'S' | 'M' | 'L';

export type SweetnessLevel = '100%' | '70%' | '50%' | '30%' | '0%';

export type IceLevel = '100%' | '70%' | '50%' | 'Đá riêng' | 'Không đá';

export interface SizeOption {
  id: string;
  code: SizeCode;
  name: string;
  extraPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  category: CategorySummary;
  sizes: SizeOption[];
  toppings: Topping[];
}

export interface CustomizationState {
  size: SizeCode;
  toppingIds: string[];
  sweetness: SweetnessLevel;
  ice: IceLevel;
  quantity: number;
  note: string;
}

export interface PriceCalculationResult {
  basePrice: number;
  sizeExtraPrice: number;
  toppingsTotal: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  formattedTotal: string;
}

export interface CartItemPayload {
  cartItemId: string;
  productId: string;
  name: string;
  imageUrl: string;
  selectedSize: SizeOption;
  selectedToppings: Topping[];
  sweetness: SweetnessLevel;
  ice: IceLevel;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}
