import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { BatchUpdatePriceTableProductDto } from './dto/batch-update-price-table-product.dto';
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

  @Post(':priceTableId/products/batch')
  @ApiQuery({ name: 'companyId', type: Number, required: true })
  @ApiParam({ name: 'priceTableId', type: Number })
  @ApiBody({ type: BatchUpdatePriceTableProductDto })
  @ApiResponse({ status: 200, type: [PriceTableProductEntity] })
  async batchUpdatePriceTableProducts(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Param('priceTableId', ParseIntPipe) priceTableId: number,
    @Body() body: BatchUpdatePriceTableProductDto,
  ): Promise<PriceTableProductEntity[]> {
    if (!body.updates || body.updates.length === 0) {
      throw new BadRequestException('Updates array is required and cannot be empty.');
    }

    if (body.updates.length > 1000) {
      throw new BadRequestException('Maximum 1000 items allowed per batch.');
    }

    // Validate each update item
    for (const update of body.updates) {
      if (update.productId === undefined || update.price === undefined) {
        throw new BadRequestException('Each update must contain productId and price.');
      }

      const price = Number(update.price);
      if (Number.isNaN(price) || price <= 0) {
        throw new BadRequestException('Price must be a positive numeric value.');
      }
    }

    return this.priceTableService.batchUpdatePriceTableProducts(
      companyId,
      priceTableId,
      body.updates,
    );
  }
}
