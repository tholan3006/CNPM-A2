import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CalculatePriceRequestDto } from './dto/calculate-price.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.productsService.findAll(search, category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/toppings')
  async findProductToppings(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return product.toppings;
  }

  @Post(':id/calculate-price')
  @HttpCode(HttpStatus.OK)
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
