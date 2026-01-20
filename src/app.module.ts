import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { DbModule } from './db/db.module';
import { PriceTableModule } from './price-table/price-table.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DbModule,
    PriceTableModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        APP_KEYS_FILE: Joi.string().required(),
        ACCESS_LOG_FILE: Joi.string().required(),
      }).unknown(true),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule { }
