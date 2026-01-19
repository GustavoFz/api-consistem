import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePriceTableProductDto {
  @ApiPropertyOptional({ example: 199.99 })
  price?: number;

  @ApiPropertyOptional({ example: 199.99 })
  precoTabela?: number;
}
