import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { MissingCodesResponseEntity } from './entities/missing-codes.entity';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private db: DbService) { }

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

  async findMissingCodes(): Promise<MissingCodesResponseEntity> {
    try {
      const maxCodeResult = (await this.db.cache(
        `SELECT MAX(codigo) as lastCode FROM Cgi.Item`,
      )) as Array<{ lastCode: number }>;

      if (!maxCodeResult.length || !maxCodeResult[0].lastCode) {
        return {
          lastCode: 0,
          missingCodes: [],
          totalMissing: 0,
        };
      }

      const lastCode = Number(maxCodeResult[0].lastCode);

      const existingCodesResult = (await this.db.cache(
        `SELECT DISTINCT codigo FROM Cgi.Item WHERE codigo IS NOT NULL AND codigo <= ${lastCode} ORDER BY codigo`,
      )) as Array<{ codigo: number }>;

      const existingCodes = new Set(existingCodesResult.map(row => Number(row.codigo)));
      const missingCodes: number[] = [];

      for (let i = 1; i <= lastCode; i++) {
        if (!existingCodes.has(i)) {
          missingCodes.push(i);
        }
      }

      return {
        lastCode,
        missingCodes,
        totalMissing: missingCodes.length,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
