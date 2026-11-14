import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductDetailResponseDto, SizeOptionDto, ToppingDto } from './dto/product-detail.dto';
import { CalculatePriceRequestDto, PriceBreakdownDto } from './dto/calculate-price.dto';
import { SizeCode, SweetnessLevel, IceLevel } from './entities/product-option.entity';
import { ProductStatus } from './entities/product.entity';

@Injectable()
export class ProductsService {
  // In-memory mock database aligned with PostgreSQL seed data
  private products = [
    {
      id: 'prod-01',
      categoryId: 'cat-01',
      categoryName: 'Cà phê Đặc Biệt',
      categorySlug: 'ca-phe-dac-biet',
      name: 'Cà phê Muối Biển',
      description: 'Cà phê Robusta Đắk Lắk đậm đà hòa quyện cùng lớp bọt kem phô mai mặn béo ngậy.',
      basePrice: 35000,
      imageUrl: '/images/salt-coffee.webp',
      stock: 85,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-01', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
        { id: 's-02', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-03', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-02', 'top-03', 'top-04', 'top-05'],
    },
    {
      id: 'prod-02',
      categoryId: 'cat-01',
      categoryName: 'Cà phê Đặc Biệt',
      categorySlug: 'ca-phe-dac-biet',
      name: 'Cà phê Trứng Hà Nội',
      description: 'Lớp lòng đỏ trứng gà đánh bông mịn cùng mật ong trên nền cà phê phin nguyên chất nóng hổi.',
      basePrice: 42000,
      imageUrl: '/images/egg-coffee.webp',
      stock: 30,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-04', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: 0, isDefault: false, isAvailable: true },
        { id: 's-05', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-06', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 12000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-02'],
    },
    {
      id: 'prod-03',
      categoryId: 'cat-02',
      categoryName: 'Trà Trái Cây & Matcha',
      categorySlug: 'tra-trai-cay',
      name: 'Trà Đào Cam Sả',
      description: 'Vị trà thanh mát kết hợp lát đào giòn ngọt tự nhiên, nước cốt cam sành và hương sả thơm lừng.',
      basePrice: 39000,
      imageUrl: '/images/peach-tea.webp',
      stock: 60,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-07', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-08', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 8000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-03', 'top-05'],
    },
  ];

  private toppings: ToppingDto[] = [
    { id: 'top-01', name: 'Thạch cà phê giòn', price: 6000, stock: 50, isAvailable: true },
    { id: 'top-02', name: 'Kem mặn phô mai', price: 10000, stock: 35, isAvailable: true },
    { id: 'top-03', name: 'Trân châu hoàng kim', price: 8000, stock: 45, isAvailable: true },
    { id: 'top-04', name: 'Sốt caramel macchiato', price: 8000, stock: 20, isAvailable: true },
    { id: 'top-05', name: 'Hạt sen tươi ngâm đường', price: 12000, stock: 0, isAvailable: false }, // Out of stock
  ];

  async findAll(searchQuery?: string, categorySlug?: string) {
    let result = this.products.filter((p) => p.isActive);
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categorySlug) {
      result = result.filter((p) => p.categorySlug === categorySlug);
    }
    return result.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.basePrice,
      imageUrl: p.imageUrl,
      stock: p.stock,
      category: p.categoryName,
      isAvailable: p.stock > 0,
    }));
  }

  async findOne(id: string): Promise<ProductDetailResponseDto> {
    const product = this.products.find((p) => p.id === id && p.isActive);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const availableToppings = this.toppings.filter((t) =>
      product.allowedToppingIds.includes(t.id),
    );

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      stock: product.stock,
      isAvailable: product.stock > 0,
      category: {
        id: product.categoryId,
        name: product.categoryName,
        slug: product.categorySlug,
      },
      sizes: product.sizes,
      toppings: availableToppings,
    };
  }

  async findAllToppings(availableOnly = true): Promise<ToppingDto[]> {
    if (availableOnly) {
      return this.toppings.filter((t) => t.isAvailable && t.stock > 0);
    }
    return this.toppings;
  }

  async calculateCustomizationPrice(dto: CalculatePriceRequestDto): Promise<PriceBreakdownDto> {
    const product = await this.findOne(dto.productId);

    // Validate and locate selected size
    const sizeOption = product.sizes.find((s) => s.code === dto.sizeCode);
    if (!sizeOption) {
      throw new BadRequestException(`Size code "${dto.sizeCode}" is not available for this product`);
    }

    // Validate and locate toppings
    const selectedToppingsList: Array<{ id: string; name: string; price: number }> = [];
    let toppingsSubtotal = 0;

    if (dto.toppingIds && dto.toppingIds.length > 0) {
      for (const tId of dto.toppingIds) {
        const topping = this.toppings.find((t) => t.id === tId);
        if (!topping) {
          throw new BadRequestException(`Topping with ID "${tId}" does not exist`);
        }
        if (!topping.isAvailable || topping.stock <= 0) {
          throw new BadRequestException(`Topping "${topping.name}" is currently out of stock`);
        }
        selectedToppingsList.push({
          id: topping.id,
          name: topping.name,
          price: topping.price,
        });
        toppingsSubtotal += topping.price;
      }
    }

    // Validate quantity
    const quantity = Math.max(1, dto.quantity || 1);
    if (quantity > product.stock) {
      throw new BadRequestException(`Requested quantity (${quantity}) exceeds available stock (${product.stock})`);
    }

    const unitPrice = product.basePrice + sizeOption.extraPrice + toppingsSubtotal;
    const totalPrice = unitPrice * quantity;

    const formula = `(${product.basePrice.toLocaleString('vi-VN')}đ [Base] + ${sizeOption.extraPrice.toLocaleString('vi-VN')}đ [${sizeOption.name}] + ${toppingsSubtotal.toLocaleString('vi-VN')}đ [Toppings]) × ${quantity} = ${totalPrice.toLocaleString('vi-VN')}đ`;

    return {
      basePrice: product.basePrice,
      sizeExtraPrice: sizeOption.extraPrice,
      sizeCode: dto.sizeCode,
      toppings: selectedToppingsList,
      toppingsSubtotal,
      unitPrice,
      quantity,
      totalPrice,
      formula,
    };
  }
}
