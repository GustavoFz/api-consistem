import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidatorStatus } from '../validator-status.pipe';
import { UpdatePriceTableProductDto } from './dto/update-price-table-product.dto';
import { PriceTableProductEntity } from './entities/price-table-product.entity';
import { PriceTableEntity } from './entities/price-table.entity';
import { PriceTableService } from './price-table.service';

@ApiTags('Price Tables')
@Controller('price-tables')
export class PriceTableController {
  constructor(private readonly priceTableService: PriceTableService) { }

  @Get()
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiQuery({ name: 'status', type: Number, required: false })
  @ApiResponse({ status: 200, type: [PriceTableEntity] })
  async getPriceTables(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('status', new ValidatorStatus()) status?: number,
  ): Promise<PriceTableEntity[]> {
    return this.priceTableService.getPriceTables(companyId, status);
  }

  @Get(':priceTableId/products')
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiParam({ name: 'priceTableId', type: Number })
  @ApiResponse({ status: 200, type: [PriceTableProductEntity] })
  async getPriceTableProducts(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Param('priceTableId', ParseIntPipe) priceTableId: number,
  ): Promise<PriceTableProductEntity[]> {
    return this.priceTableService.getPriceTableProducts(
      companyId,
      priceTableId,
    );
  }

  @Get(':priceTableId/products/:productId')
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiParam({ name: 'priceTableId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiResponse({ status: 200, type: PriceTableProductEntity })
  async getPriceTableProduct(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Param('priceTableId', ParseIntPipe) priceTableId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<PriceTableProductEntity> {
    return this.priceTableService.getPriceTableProduct(
      companyId,
      priceTableId,
      productId,
    );
  }

  @Patch(':priceTableId/products/:productId')
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiParam({ name: 'priceTableId', type: Number })
  @ApiParam({ name: 'productId', type: Number })
  @ApiBody({ type: UpdatePriceTableProductDto })
  @ApiResponse({ status: 200, type: PriceTableProductEntity })
  async updatePriceTableProduct(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Param('priceTableId', ParseIntPipe) priceTableId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdatePriceTableProductDto,
  ): Promise<PriceTableProductEntity> {
    const rawPrice = body.price ?? body.precoTabela;
    if (rawPrice === undefined) {
      throw new BadRequestException('Price is required.');
    }

    const price = Number(rawPrice);
    if (Number.isNaN(price)) {
      throw new BadRequestException('Price must be a numeric value.');
    }

    if (price <= 0) {
      throw new BadRequestException('Price must be a positive number.');
    }

    return this.priceTableService.updatePriceTableProduct(
      companyId,
      priceTableId,
      productId,
      price,
    );
  }
}
