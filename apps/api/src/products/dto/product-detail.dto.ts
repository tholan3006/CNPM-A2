import { SizeCode } from '../entities/product-option.entity';

export class SizeOptionDto {
  id: string;
  code: SizeCode;
  name: string;
  extraPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export class ToppingDto {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export class CategorySummaryDto {
  id: string;
  name: string;
  slug: string;
}

export class ProductDetailResponseDto {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  category: CategorySummaryDto;
  sizes: SizeOptionDto[];
  toppings: ToppingDto[];
}
