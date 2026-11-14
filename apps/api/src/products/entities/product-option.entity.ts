export enum SizeCode {
  S = 'S',
  M = 'M',
  L = 'L',
}

export enum SweetnessLevel {
  SWEET_100 = '100%',
  SWEET_70 = '70%',
  SWEET_50 = '50%',
  SWEET_30 = '30%',
  SWEET_0 = '0%',
}

export enum IceLevel {
  ICE_100 = '100%',
  ICE_70 = '70%',
  ICE_50 = '50%',
  ICE_SEPARATE = 'Đá riêng',
  ICE_NO = 'Không đá',
}

export class SizeOptionEntity {
  id: string;
  productId: string;
  sizeCode: SizeCode;
  name: string;
  extraPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

export class ToppingEntity {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export class ProductToppingEntity {
  productId: string;
  toppingId: string;
  isDefault: boolean;
}
