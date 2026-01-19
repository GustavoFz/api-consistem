import { ApiProperty } from '@nestjs/swagger';

export class GetPriceTableProductsQueryDto {
  @ApiProperty({ example: 1 })
  companyId: number;
}
