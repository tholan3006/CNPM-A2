export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class ProductEntity {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  stock: number;
  status: ProductStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
