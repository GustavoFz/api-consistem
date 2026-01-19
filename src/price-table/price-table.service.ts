import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbService } from '../db/db.service';

@Injectable()
export class PriceTableService {
  constructor(
    private env: ConfigService,
    private db: DbService,
  ) { }

  async getTabelaPrecoItem() {
    try {
      return await this.db.cache(
        'SELECT * FROM Ped.TabelaPrecoItem WHERE codProduto=11 AND codTabela=105 AND codEmpresa=1',
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getTabelaPreco() {
    try {
      const rows = (await this.db.cache(
        'SELECT codTabela, descricao FROM Ped.TabelaPreco WHERE codEmpresa=1 AND situacao=1',
      )) as Array<{ codTabela: number; descricao: string }>;
      return rows.map((row) => ({
        codTabela: row.codTabela,
        descricao: row.descricao,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async updateTabelaPrecoItem(codProduto: string, precoTabela: number) {
    try {
      const precoTabelaScaled = precoTabela * 100000;
      return await this.db.cache(
        `UPDATE Ped.TabelaPrecoItem SET precoTabela=${precoTabelaScaled} WHERE codProduto=${codProduto} AND codTabela=105 AND codEmpresa=1`,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
