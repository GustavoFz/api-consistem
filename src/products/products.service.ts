import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private db: DbService) {}

  async findAll(companyId: number): Promise<ProductEntity[]> {
    try {
      const rows = (await this.db.cache(
        `SELECT codItem, descricao1, pesoLiquido FROM Cgi.ItemSaida WHERE codEmpresa=${companyId}`,
      )) as Array<{
        codItem: number;
        descricao1: string;
        pesoLiquido: number;
      }>;

      return rows.map((row) => ({
        code: row.codItem,
        name: row.descricao1,
        netWeight: row.pesoLiquido,
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findOne(companyId: number, codItem: number): Promise<ProductEntity> {
    try {
      const rows = (await this.db.cache(
        `SELECT codItem, descricao1, pesoLiquido FROM Cgi.ItemSaida WHERE codEmpresa=${companyId} AND codItem=${codItem}`,
      )) as Array<{
        codItem: number;
        descricao1: string;
        pesoLiquido: number;
      }>;

      if (!rows.length) {
        throw new NotFoundException('Product not found.');
      }

      return {
        code: rows[0].codItem,
        name: rows[0].descricao1,
        netWeight: rows[0].pesoLiquido,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException();
    }
  }
}
