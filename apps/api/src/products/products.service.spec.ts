import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService (Member 1 - Menu Flow Unit Tests)', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockProduct = {
    id: 'prod-uuid-1',
    name: 'Cà phê sữa',
    description: 'Cà phê Robusta truyền thống thơm ngon',
    price: 35000,
    imageUrl: '/images/ca-phe-sua.jpg',
    stock: 50,
    version: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopping = {
    id: 'top-uuid-1',
    name: 'Trân châu trắng',
    price: 10000,
    isAvailable: true,
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    topping: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll (GET /products)', () => {
    it('should return list of active products with numeric price and inferred category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cà phê sữa');
      expect(result[0].price).toBe(35000);
      expect(result[0].category).toBe('Cà phê truyền thống');
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should filter by search query when search string is provided', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll('cà phê');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'cà phê', mode: 'insensitive' } },
            { description: { contains: 'cà phê', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findOne (GET /products/:id)', () => {
    it('should return product details including available toppings', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.topping.findMany.mockResolvedValue([mockTopping]);

      const result = await service.findOne('prod-uuid-1');

      expect(result.id).toBe('prod-uuid-1');
      expect(result.name).toBe('Cà phê sữa');
      expect(result.toppings).toHaveLength(1);
      expect(result.toppings[0].name).toBe('Trân châu trắng');
    });

    it('should throw NotFoundException if product is not found or inactive', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllToppings', () => {
    it('should return only available toppings', async () => {
      mockPrismaService.topping.findMany.mockResolvedValue([mockTopping]);

      const result = await service.findAllToppings();

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(10000);
      expect(mockPrismaService.topping.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
        orderBy: { price: 'asc' },
      });
    });
  });
});
