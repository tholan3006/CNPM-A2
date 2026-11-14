import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SizeCode } from './entities/product-option.entity';

describe('ProductsService (Menu & Product Customization Flow)', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (GET /products - Member 1: Menu Flow)', () => {
    it('tra ve danh sach menu day du cac san pham dang hoat dong', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('price');
      expect(result[0]).toHaveProperty('category');
    });

    it('loc san pham theo tu khoa tim kiem (Search Query)', async () => {
      const result = await service.findAll('Muối');
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('Muối');
    });

    it('loc san pham theo slug danh muc (Category Filter)', async () => {
      const result = await service.findAll(undefined, 'ca-phe-dac-biet');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) => {
        expect(p.category).toBe('Cà phê Đặc Biệt');
      });
    });
  });

  describe('findOne (GET /products/:id - Member 2: Product Detail)', () => {
    it('tra ve chi tiet san pham day du kem cac size va topping kha dung', async () => {
      const result = await service.findOne('prod-01');

      expect(result).toBeDefined();
      expect(result.id).toBe('prod-01');
      expect(result.name).toBe('Cà phê Muối Biển');
      expect(result.basePrice).toBe(35000);
      expect(result.sizes).toHaveLength(3);
      expect(result.sizes.find((s) => s.code === SizeCode.M)?.isDefault).toBe(true);
      expect(result.toppings.length).toBeGreaterThan(0);
      expect(result.category.name).toBe('Cà phê Đặc Biệt');
    });

    it('nem loi NotFoundException neu product id khong ton tai', async () => {
      await expect(service.findOne('invalid-id-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculateCustomizationPrice (Dynamic Pricing Verification)', () => {
    it('tinh gia chinh xac voi Size M mac dinh va khong kem topping (1 ly)', async () => {
      const breakdown = await service.calculateCustomizationPrice({
        productId: 'prod-01',
        sizeCode: SizeCode.M,
        toppingIds: [],
        quantity: 1,
      });

      expect(breakdown.basePrice).toBe(35000);
      expect(breakdown.sizeExtraPrice).toBe(0);
      expect(breakdown.toppingsSubtotal).toBe(0);
      expect(breakdown.unitPrice).toBe(35000);
      expect(breakdown.totalPrice).toBe(35000);
    });

    it('tinh gia tang them khi chon Size L (+10.000d)', async () => {
      const breakdown = await service.calculateCustomizationPrice({
        productId: 'prod-01',
        sizeCode: SizeCode.L,
        toppingIds: [],
        quantity: 1,
      });

      expect(breakdown.basePrice).toBe(35000);
      expect(breakdown.sizeExtraPrice).toBe(10000);
      expect(breakdown.unitPrice).toBe(45000);
      expect(breakdown.totalPrice).toBe(45000);
    });

    it('tinh tong gia phuc tap: Size L (+10k) + 2 Topping (Thach 6k + Kem man 10k) x 2 ly', async () => {
      const breakdown = await service.calculateCustomizationPrice({
        productId: 'prod-01',
        sizeCode: SizeCode.L,
        toppingIds: ['top-01', 'top-02'], // 6.000 + 10.000 = 16.000
        quantity: 2,
      });

      // UnitPrice = 35.000 (Base) + 10.000 (Size L) + 16.000 (Toppings) = 61.000
      expect(breakdown.unitPrice).toBe(61000);
      // Total = 61.000 * 2 = 122.000
      expect(breakdown.totalPrice).toBe(122000);
      expect(breakdown.toppings).toHaveLength(2);
    });

    it('nem loi BadRequestException neu chon topping da het hang', async () => {
      await expect(
        service.calculateCustomizationPrice({
          productId: 'prod-01',
          sizeCode: SizeCode.M,
          toppingIds: ['top-05'], // top-05 is out of stock (stock: 0)
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('nem loi BadRequestException neu so luong vuot qua ton kho', async () => {
      await expect(
        service.calculateCustomizationPrice({
          productId: 'prod-01',
          sizeCode: SizeCode.M,
          toppingIds: [],
          quantity: 9999, // Stock is 85
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllToppings', () => {
    it('chi tra ve danh sach topping con hang khi bat availableOnly = true', async () => {
      const availableToppings = await service.findAllToppings(true);
      expect(availableToppings.every((t) => t.isAvailable && t.stock > 0)).toBe(true);
      expect(availableToppings.find((t) => t.id === 'top-05')).toBeUndefined();
    });
  });
});
