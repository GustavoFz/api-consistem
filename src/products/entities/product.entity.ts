import { ApiProperty } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty({ example: 12345 })
  code: number;

  @ApiProperty({ example: 'Produto Exemplo' })
  name: string;

  @ApiProperty({ example: 1.5 })
  netWeight: number;
}
