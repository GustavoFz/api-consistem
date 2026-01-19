import { ApiProperty } from '@nestjs/swagger';

export class PriceTableEntity {
  @ApiProperty({ example: 105 })
  priceTableId: number;

  @ApiProperty({ example: 'Tabela padrao' })
  description: string;
}
