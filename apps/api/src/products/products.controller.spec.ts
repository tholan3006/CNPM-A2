import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController (Member 1 - Menu Flow Unit Tests)', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductResponse = {
    id: 'prod-uuid-1',
    name: 'Americano',
    description: 'Espresso thanh nhẹ',
    price: 40000,
    imageUrl: '/images/americano.jpg',
    stock: 40,
    category: 'Cà phê Espresso',
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllToppings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll (GET /products)', () => {
    it('should call productsService.findAll with search query', async () => {
      mockProductsService.findAll.mockResolvedValue([mockProductResponse]);

      const result = await controller.findAll('Americano');

      expect(mockProductsService.findAll).toHaveBeenCalledWith('Americano');
      expect(result).toEqual([mockProductResponse]);
    });
  });

  describe('findOne (GET /products/:id)', () => {
    it('should call productsService.findOne with product id', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProductResponse);

      const result = await controller.findOne('prod-uuid-1');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('prod-uuid-1');
      expect(result).toEqual(mockProductResponse);
    });
  });

  describe('findAllToppings (GET /products/toppings)', () => {
    it('should call productsService.findAllToppings', async () => {
      const mockToppings = [{ id: 'top-1', name: 'Kem cheese', price: 10000 }];
      mockProductsService.findAllToppings.mockResolvedValue(mockToppings);

      const result = await controller.findAllToppings();

      expect(mockProductsService.findAllToppings).toHaveBeenCalled();
      expect(result).toEqual(mockToppings);
    });
  });
});
