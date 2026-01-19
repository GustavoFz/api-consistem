import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PriceTableService } from './price-table.service';

@Controller()
export class PriceTableController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly priceTableService: PriceTableService) { }

  @Get('tabela-preco-item')
  async getTabelaPrecoItem() {
    return this.priceTableService.getTabelaPrecoItem();
  }

  @Get('tabela-preco')
  async getTabelaPreco() {
    return this.priceTableService.getTabelaPreco();
  }

  @Patch('tabela-preco-item/:codProduto')
  async updateTabelaPrecoItem(
    @Param('codProduto') codProduto: string,
    @Body('precoTabela') precoTabela: number,
  ) {
    return this.priceTableService.updateTabelaPrecoItem(
      codProduto,
      precoTabela,
    );
  }
}
