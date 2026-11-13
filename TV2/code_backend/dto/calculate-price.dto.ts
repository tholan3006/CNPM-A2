import { SizeCode, SweetnessLevel, IceLevel } from '../entities/product-option.entity';

export class CalculatePriceRequestDto {
  productId: string;
  sizeCode: SizeCode;
  toppingIds: string[];
  sweetness?: SweetnessLevel;
  ice?: IceLevel;
  quantity: number;
}

export class PriceBreakdownDto {
  basePrice: number;
  sizeExtraPrice: number;
  sizeCode: SizeCode;
  toppings: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  toppingsSubtotal: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  formula: string;
}
