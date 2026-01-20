import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as mysql from 'mysql2/promise';
import * as odbc from 'odbc';

@Injectable()
export class DbService {
  constructor(private env: ConfigService) {}

  private readonly dbConfig = {
    host: this.env.get<string>('MYSQL_HOST'),
    user: this.env.get<string>('MYSQL_USERNAME'),
    password: this.env.get<string>('MYSQL_PASSWORD'),
    database: this.env.get<string>('MYSQL_DATABASE'),
  };

  private readonly odbcConfig = this.env.get<string>('CACHE_ODBC_CONFIG');

  async cache(sql: string) {
    try {
      const connection = await odbc.connect(this.odbcConfig);
      const result = await connection.query(sql);
      await connection.close();
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async transaction<T>(queries: string[]): Promise<T[]> {
    let connection: odbc.Connection | null = null;
    try {
      connection = await odbc.connect(this.odbcConfig);
      
      // Begin transaction
      await connection.query('START TRANSACTION');
      
      const results: T[] = [];
      for (const sql of queries) {
        const result = await connection.query(sql);
        results.push(result as T);
      }
      
      // Commit transaction
      await connection.query('COMMIT');
      
      return results;
    } catch (error) {
      // Rollback on error
      if (connection) {
        try {
          await connection.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      
      console.error('Transaction error:', error);
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async mysql(query, values) {
    const connection = await mysql.createConnection(this.dbConfig);
    await connection.query(query, values);
    connection.end();
  }

  async mysqlSelect(query) {
    const connection = await mysql.createConnection(this.dbConfig);
    const [results]: mysql.RowDataPacket[] | any =
      await connection.query(query);
    connection.end();

    return results;
  }
}
