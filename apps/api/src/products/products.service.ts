import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDetailResponseDto, SizeOptionDto, ToppingDto } from './dto/product-detail.dto';
import { CalculatePriceRequestDto, PriceBreakdownDto } from './dto/calculate-price.dto';
import { SizeCode } from './entities/product-option.entity';
import { ProductStatus } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  private inferCategory(name: string, description?: string | null): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('matcha')) return 'Trà & Matcha';
    if (lowerName.includes('cold brew') || lowerName.includes('coldbrew')) return 'Cold Brew';
    if (lowerName.includes('trà') || lowerName.includes('đào')) return 'Trà hoa quả';
    if (lowerName.includes('sữa') || lowerName.includes('muối') || lowerName.includes('trứng')) return 'Cà phê truyền thống';
    return 'Cà phê Espresso';
  }

  // Danh mục sản phẩm đồng bộ giữa A1 và A2
  private products = [
    {
      id: 'prod-01',
      categoryId: 'cat-01',
      categoryName: 'Cà phê truyền thống',
      categorySlug: 'ca-phe-truyen-thong',
      name: 'Cà phê sữa',
      description: 'Cà phê Robusta truyền thống kết hợp sữa đặc ngọt béo đậm đà chuẩn vị.',
      basePrice: 35000,
      imageUrl: '/images/ca-phe-sua.jpg',
      stock: 50,
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
      categoryName: 'Cà phê Espresso',
      categorySlug: 'ca-phe-espresso',
      name: 'Americano',
      description: 'Espresso đậm vị pha loãng cùng nước tinh khiết thanh nhẹ.',
      basePrice: 40000,
      imageUrl: '/images/americano.jpg',
      stock: 40,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-04', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
        { id: 's-05', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-06', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-02'],
    },
    {
      id: 'prod-03',
      categoryId: 'cat-01',
      categoryName: 'Cà phê Espresso',
      categorySlug: 'ca-phe-espresso',
      name: 'Cappuccino',
      description: 'Espresso Ý hòa quyện cùng lớp bọt sữa mịn màng bồng bềnh.',
      basePrice: 45000,
      imageUrl: '/images/cappuccino.jpg',
      stock: 35,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-07', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
        { id: 's-08', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-09', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-02'],
    },
    {
      id: 'prod-04',
      categoryId: 'cat-02',
      categoryName: 'Trà hoa quả',
      categorySlug: 'tra-hoa-qua',
      name: 'Trà đào',
      description: 'Trà đào thanh mát kết hợp miếng đào tươi giòn ngọt ngào sảng khoái.',
      basePrice: 39000,
      imageUrl: '/images/tra-dao.jpg',
      stock: 60,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-10', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-11', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 8000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-03'],
    },
    {
      id: 'prod-05',
      categoryId: 'cat-01',
      categoryName: 'Cold Brew',
      categorySlug: 'cold-brew',
      name: 'Cold Brew',
      description: 'Cà phê ủ lạnh 16 tiếng hương vị êm dịu, mượt mà thanh mát tự nhiên.',
      basePrice: 45000,
      imageUrl: '/images/cold-brew.jpg',
      stock: 50,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-12', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-13', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-04'],
    },
    {
      id: 'prod-06',
      categoryId: 'cat-02',
      categoryName: 'Trà & Matcha',
      categorySlug: 'tra-matcha',
      name: 'Matcha Latte',
      description: 'Trà xanh Uji Nhật Bản thượng hạng hòa quyện sữa tươi béo ngậy thơm lừng.',
      basePrice: 48000,
      imageUrl: '/images/matcha-latte.jpg',
      stock: 45,
      status: ProductStatus.ACTIVE,
      isActive: true,
      sizes: [
        { id: 's-14', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
        { id: 's-15', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
        { id: 's-16', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
      ],
      allowedToppingIds: ['top-01', 'top-03'],
    },
  ];

  private toppings: ToppingDto[] = [
    { id: 'top-01', name: 'Thạch cà phê giòn', price: 6000, stock: 50, isAvailable: true },
    { id: 'top-02', name: 'Kem mặn phô mai', price: 10000, stock: 35, isAvailable: true },
    { id: 'top-03', name: 'Trân châu hoàng kim', price: 8000, stock: 45, isAvailable: true },
    { id: 'top-04', name: 'Sốt caramel macchiato', price: 8000, stock: 20, isAvailable: true },
    { id: 'top-05', name: 'Hạt sen tươi ngâm đường', price: 12000, stock: 0, isAvailable: false },
  ];

  async findAll(searchQuery?: string, categorySlug?: string) {
    if (this.prisma) {
      try {
        const trimmed = searchQuery?.trim();
        const dbProducts = await this.prisma.product.findMany({
          where: {
            isActive: true,
            ...(trimmed
              ? {
                  OR: [
                    { name: { contains: trimmed, mode: 'insensitive' } },
                    { description: { contains: trimmed, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: 'asc' },
        });

        if (dbProducts && dbProducts.length > 0) {
          let result = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: Number(p.price),
            imageUrl: p.imageUrl || '/images/ca-phe-sua.jpg',
            stock: (p as any).stock ?? 50,
            category: (p as any).category || this.inferCategory(p.name, p.description),
            isAvailable: true,
          }));

          if (categorySlug) {
            const slugLower = categorySlug.toLowerCase();
            result = result.filter(
              (p) =>
                p.category.toLowerCase().includes(slugLower) ||
                slugLower.includes(p.category.toLowerCase()),
            );
          }
          return result;
        }
      } catch (err) {
        // Fallback to memory
      }
    }

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
    if (this.prisma) {
      try {
        const dbProduct = await this.prisma.product.findUnique({
          where: { id },
        });
        if (dbProduct && dbProduct.isActive) {
          const dbToppings = await this.prisma.topping.findMany({
            where: { isAvailable: true },
          });

          return {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description,
            basePrice: Number(dbProduct.price),
            imageUrl: dbProduct.imageUrl || '/images/ca-phe-sua.jpg',
            stock: (dbProduct as any).stock ?? 50,
            isAvailable: true,
            category: {
              id: (dbProduct as any).categoryId || 'cat-01',
              name: (dbProduct as any).category || this.inferCategory(dbProduct.name, dbProduct.description),
              slug: 'ca-phe',
            },
            sizes: [
              { id: 's-01', code: SizeCode.S, name: 'Nhỏ (Size S)', extraPrice: -5000, isDefault: false, isAvailable: true },
              { id: 's-02', code: SizeCode.M, name: 'Vừa (Size M - Chuẩn)', extraPrice: 0, isDefault: true, isAvailable: true },
              { id: 's-03', code: SizeCode.L, name: 'Lớn (Size L)', extraPrice: 10000, isDefault: false, isAvailable: true },
            ],
            toppings: dbToppings.map((t) => ({
              id: t.id,
              name: t.name,
              price: Number(t.price),
              isAvailable: t.isAvailable,
              stock: 99,
            })),
          };
        }
      } catch (err) {
        // Fallback to memory
      }
    }

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
    if (this.prisma) {
      try {
        const dbToppings = await this.prisma.topping.findMany({
          where: availableOnly ? { isAvailable: true } : {},
          orderBy: { price: 'asc' },
        });
        if (dbToppings && dbToppings.length > 0) {
          return dbToppings.map((t) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price),
            isAvailable: t.isAvailable,
            stock: 99,
          }));
        }
      } catch (err) {
        // Fallback to memory
      }
    }

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
      const allToppings = await this.findAllToppings(false);
      for (const tId of dto.toppingIds) {
        const topping = allToppings.find((t) => t.id === tId);
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
