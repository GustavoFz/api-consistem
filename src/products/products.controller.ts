import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductEntity } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiResponse({ status: 200, type: [ProductEntity] })
  async getProducts(
    @Query('companyId', ParseIntPipe) companyId: number,
  ): Promise<ProductEntity[]> {
    return this.productsService.findAll(companyId);
  }

  @Get(':codItem')
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiParam({ name: 'codItem', type: Number })
  @ApiResponse({ status: 200, type: ProductEntity })
  async getProduct(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Param('codItem', ParseIntPipe) codItem: number,
  ): Promise<ProductEntity> {
    return this.productsService.findOne(companyId, codItem);
  }
}
