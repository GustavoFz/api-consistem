import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessLogInterceptor } from './access-log.interceptor';
import { ApiKeyGuard } from './api-key.guard';
import { AppKeyService } from './app-key.service';
import {
  APP_KEYS_REPOSITORY,
  FileAppKeysRepository,
} from './app-keys.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    AppKeyService,
    {
      provide: APP_KEYS_REPOSITORY,
      useClass: FileAppKeysRepository,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AccessLogInterceptor,
    },
  ],
})
export class AuthModule { }
