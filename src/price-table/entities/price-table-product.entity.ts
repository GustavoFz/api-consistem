import { ApiProperty } from '@nestjs/swagger';

export class PriceTableProductEntity {
  @ApiProperty({ example: 105 })
  priceTableId: number;

  @ApiProperty({ example: 11 })
  productId: number;

  @ApiProperty({ example: 'Produto 11', required: false })
  name?: string;

  @ApiProperty({ example: 199.99 })
  price: number;
}
