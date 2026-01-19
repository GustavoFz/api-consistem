import { ApiProperty } from '@nestjs/swagger';

export class GetPriceTablesQueryDto {
  @ApiProperty({ example: 1 })
  companyId: number;
}
