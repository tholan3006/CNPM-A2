import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SizeCode } from './entities/product-option.entity';

describe('ProductsController (Menu & Product Detail API Tests)', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /products (Member 1: Menu List & Filter)', () => {
    it('tra ve danh sach menu day du', async () => {
      const result = await controller.findAll();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('tra ve danh sach menu loc theo search query', async () => {
      const result = await controller.findAll('Muối');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('Muối');
    });
  });

  describe('GET /products/:id (Member 2: Product Detail)', () => {
    it('chuyen tiep loi goi lay chi tiet mon den ProductsService', async () => {
      const result = await controller.findOne('prod-01');
      expect(result).toBeDefined();
      expect(result.id).toBe('prod-01');
      expect(result.sizes).toBeDefined();
      expect(result.toppings).toBeDefined();
    });
  });

  describe('GET /products/:id/toppings (Member 2)', () => {
    it('tra ve danh sach toppings danh rieng cho san pham', async () => {
      const toppings = await controller.findProductToppings('prod-01');
      expect(Array.isArray(toppings)).toBe(true);
      expect(toppings.length).toBeGreaterThan(0);
    });
  });

  describe('POST /products/:id/calculate-price (Member 2: Dynamic Pricing)', () => {
    it('goi service xac minh tinh toan gia dong', async () => {
      const breakdown = await controller.calculatePrice('prod-01', {
        sizeCode: SizeCode.M,
        toppingIds: ['top-01'],
        quantity: 1,
      });

      expect(breakdown).toBeDefined();
      expect(breakdown.totalPrice).toBe(35000 + 6000);
    });
  });
});
