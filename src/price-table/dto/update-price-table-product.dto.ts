import { ApiProperty } from '@nestjs/swagger';

export class UpdatePriceTableProductDto {
  @ApiProperty({ example: 199.99 })
  price: number;
}
