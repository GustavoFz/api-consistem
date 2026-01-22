import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { PriceTableProductEntity } from './entities/price-table-product.entity';
import { PriceTableEntity } from './entities/price-table.entity';
import { PriceTableProductWithWeightEntity } from './entities/price-table-product-with-weight.entity';

@Injectable()
export class PriceTableService {
  constructor(private db: DbService) { }

  async getPriceTables(
    companyId: number,
    status?: number,
  ): Promise<PriceTableEntity[]> {
    try {
      const filters = [`codEmpresa=${companyId}`];
      if (status !== undefined) {
        filters.push(`situacao=${status}`);
      }

      const whereClause = filters.join(' AND ');
      const rows = (await this.db.cache(
        `SELECT codTabela, descricao FROM Ped.TabelaPreco WHERE ${whereClause}`,
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
  ): Promise<PriceTableProductWithWeightEntity[]> {
    try {
      const rows = (await this.db.cache(
        `SELECT 
              T.codProduto, 
              T.produto, 
              T.precoTabela, 
              I.pesoLiquido
        FROM 
              Ped.TabelaPrecoItem AS T
        INNER JOIN 
              Cgi.ItemSaida AS I 
        ON 
            T.codEmpresa = I.codEmpresa 
        AND 
            T.codProduto = I.codItem
        WHERE 
            T.codEmpresa = ${companyId} 
        AND 
            T.codTabela = ${priceTableId} 
        AND 
            precoTabela!=0`,
      )) as Array<{
        codProduto: number;
        produto: string;
        precoTabela: number;
        pesoLiquido: number;
      }>;

      return rows.map((row) => ({
        priceTableId,
        productId: row.codProduto,
        name: row.produto,
        price: row.precoTabela / 100000,
        netWeight: row.pesoLiquido,
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
  ): Promise<PriceTableProductWithWeightEntity> {
    try {
      const rows = (await this.db.cache(
        `SELECT 
              T.codProduto, 
              T.produto, 
              T.precoTabela, 
              I.pesoLiquido
        FROM 
              Ped.TabelaPrecoItem AS T
        INNER JOIN 
              Cgi.ItemSaida AS I 
        ON 
            T.codEmpresa = I.codEmpresa 
        AND 
            T.codProduto = I.codItem
        WHERE 
            T.codEmpresa = ${companyId} 
        AND 
            T.codTabela = ${priceTableId} 
        AND 
            T.codProduto=${productId}
        AND 
            precoTabela!=0`,

      )) as Array<{
        codProduto: number;
        produto: string;
        precoTabela: number;
        pesoLiquido: number;
      }>;

      if (!rows.length) {
        throw new NotFoundException('Price table product not found.');
      }

      return {
        priceTableId,
        productId: rows[0].codProduto,
        name: rows[0].produto,
        price: rows[0].precoTabela / 100000,
        netWeight: rows[0].pesoLiquido
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
        // Corrigir - Criar nova rota para INSERT OR UPDATE e manter a rota atual para UPDATE
        // `UPDATE Ped.TabelaPrecoItem SET precoTabela=${priceScaled} WHERE codProduto=${productId} AND codTabela=${priceTableId} AND codEmpresa=${companyId}`,
        `INSERT OR UPDATE INTO Ped.TabelaPrecoItem (codEmpresa, codTabela, codProduto, codFaixa, precoTabela, GERINF) VALUES (${companyId}, ${priceTableId}, ${productId}, 1, ${priceScaled}, 1)`,
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

  async batchUpdatePriceTableProducts(
    companyId: number,
    priceTableId: number,
    updates: Array<{ productId: number; price: number }>,
  ): Promise<PriceTableProductEntity[]> {
    try {
      const queries = updates.map(({ productId, price }) => {
        const priceScaled = price * 100000;
        // Corrigir - Criar nova rota para INSERT OR UPDATE e manter a rota atual para UPDATE
        // return `UPDATE Ped.TabelaPrecoItem SET precoTabela=${priceScaled} WHERE codProduto=${productId} AND codTabela=${priceTableId} AND codEmpresa=${companyId}`;
        return `INSERT OR UPDATE INTO Ped.TabelaPrecoItem (codEmpresa, codTabela, codProduto, codFaixa, precoTabela, GERINF) VALUES (${companyId}, ${priceTableId}, ${productId}, 1, ${priceScaled}, 1)`;
      });

      await this.db.transaction(queries);

      return updates.map(({ productId, price }) => ({
        priceTableId,
        productId,
        price,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Batch update failed');
    }
  }
}
