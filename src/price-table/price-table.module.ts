import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { PriceTableController } from './price-table.controller';
import { PriceTableService } from './price-table.service';

@Module({
  imports: [DbModule],
  controllers: [PriceTableController],
  providers: [PriceTableService],
})
export class PriceTableModule { }
