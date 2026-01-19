import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { PriceTableProductEntity } from './entities/price-table-product.entity';
import { PriceTableEntity } from './entities/price-table.entity';

@Injectable()
export class PriceTableService {
  constructor(private db: DbService) { }

  async getPriceTables(companyId: number): Promise<PriceTableEntity[]> {
    try {
      const rows = (await this.db.cache(
        `SELECT codTabela, descricao FROM Ped.TabelaPreco WHERE codEmpresa=${companyId} AND situacao=1`,
      )) as Array<{ codTabela: number; descricao: string }>;

      return rows.map((row) => ({
        priceTableId: row.codTabela,
        description: row.descricao,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getPriceTableProducts(
    companyId: number,
    priceTableId: number,
  ): Promise<PriceTableProductEntity[]> {
    try {
      const rows = (await this.db.cache(
        `SELECT codProduto, precoTabela FROM Ped.TabelaPrecoItem WHERE codEmpresa=${companyId} AND codTabela=${priceTableId}`,
      )) as Array<{ codProduto: number; precoTabela: number }>;

      return rows.map((row) => ({
        priceTableId,
        productId: row.codProduto,
        price: row.precoTabela / 100000,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getPriceTableProduct(
    companyId: number,
    priceTableId: number,
    productId: number,
  ): Promise<PriceTableProductEntity> {
    try {
      const rows = (await this.db.cache(
        `SELECT codProduto, precoTabela FROM Ped.TabelaPrecoItem WHERE codEmpresa=${companyId} AND codTabela=${priceTableId} AND codProduto=${productId}`,
      )) as Array<{ codProduto: number; precoTabela: number }>;

      if (!rows.length) {
        throw new NotFoundException('Price table product not found.');
      }

      return {
        priceTableId,
        productId: rows[0].codProduto,
        price: rows[0].precoTabela / 100000,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }

  async updatePriceTableProduct(
    companyId: number,
    priceTableId: number,
    productId: number,
    price: number,
  ): Promise<PriceTableProductEntity> {
    try {
      const priceScaled = price * 100000;
      await this.db.cache(
        `UPDATE Ped.TabelaPrecoItem SET precoTabela=${priceScaled} WHERE codProduto=${productId} AND codTabela=${priceTableId} AND codEmpresa=${companyId}`,
      );

      return {
        priceTableId,
        productId,
        price,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
