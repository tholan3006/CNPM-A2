import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CalculatePriceRequestDto } from './dto/calculate-price.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (menu) có hỗ trợ tìm kiếm và lọc danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm thành công' })
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.productsService.findAll(search, category);
  }

  @Get('toppings')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách toppings khả dụng' })
  async findAllToppings() {
    return this.productsService.findAllToppings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một sản phẩm' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/toppings')
  @ApiOperation({ summary: 'Lấy danh sách toppings dành riêng cho sản phẩm' })
  async findProductToppings(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return product.toppings;
  }

  @Post(':id/calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tính toán giá tiền tự động theo Size và Toppings' })
  async calculatePrice(
    @Param('id') id: string,
    @Body() body: Omit<CalculatePriceRequestDto, 'productId'>,
  ) {
    return this.productsService.calculateCustomizationPrice({
      ...body,
      productId: id,
    });
  }
}
