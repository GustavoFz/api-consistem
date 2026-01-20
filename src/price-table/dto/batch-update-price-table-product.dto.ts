import { ApiProperty } from '@nestjs/swagger';

export class BatchUpdateItemDto {
  @ApiProperty({ example: 123, description: 'ID do produto' })
  productId: number;

  @ApiProperty({ example: 199.99, description: 'Preço do produto' })
  price: number;
}

export class BatchUpdatePriceTableProductDto {
  @ApiProperty({ 
    type: [BatchUpdateItemDto],
    description: 'Lista de produtos para atualizar',
    maxItems: 1000
  })
  updates: BatchUpdateItemDto[];
}
