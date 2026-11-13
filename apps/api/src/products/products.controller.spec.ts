import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SizeCode } from './entities/product-option.entity';

describe('ProductsController (Product Detail & Customization API)', () => {
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

  describe('GET /products/:id', () => {
    it('chuyen tiep loi goi lay chi tiet mon den ProductsService', async () => {
      const result = await controller.findOne('prod-01');
      expect(result).toBeDefined();
      expect(result.id).toBe('prod-01');
      expect(result.sizes).toBeDefined();
      expect(result.toppings).toBeDefined();
    });
  });

  describe('GET /products/:id/toppings', () => {
    it('tra ve danh sach toppings danh rieng cho san pham', async () => {
      const toppings = await controller.findProductToppings('prod-01');
      expect(Array.isArray(toppings)).toBe(true);
      expect(toppings.length).toBeGreaterThan(0);
    });
  });

  describe('POST /products/:id/calculate-price', () => {
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
