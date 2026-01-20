import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Observable, catchError, tap } from 'rxjs';

type AccessLogEntry = {
  timestamp: string;
  appName: string;
  method: string;
  route: string;
  statusCode: number;
  ip: string;
  durationMs: number;
};

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  private logDirReady = false;

  constructor(private readonly configService: ConfigService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        void this.writeLog(context, startedAt).catch(() => undefined);
      }),
      catchError((error) => {
        void this.writeLog(context, startedAt, error).catch(() => undefined);
        throw error;
      }),
    );
  }

  private async writeLog(
    context: ExecutionContext,
    startedAt: number,
    error?: unknown,
  ): Promise<void> {
    const logFile = this.configService.get<string>('ACCESS_LOG_FILE');
    if (!logFile) {
      throw new InternalServerErrorException(
        'ACCESS_LOG_FILE is not configured',
      );
    }

    await this.ensureLogDir(logFile);

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const entry: AccessLogEntry = {
      timestamp: new Date().toISOString(),
      appName: (request as Request & { appName?: string }).appName ?? 'unknown',
      method: request.method,
      route: request.originalUrl,
      statusCode: response?.statusCode ?? (error ? 500 : 200),
      ip: request.ip,
      durationMs: Date.now() - startedAt,
    };

    const line = `${JSON.stringify(entry)}\n`;
    await fs.appendFile(logFile, line, 'utf8');
  }

  private async ensureLogDir(logFile: string): Promise<void> {
    if (this.logDirReady) {
      return;
    }

    const dir = path.dirname(logFile);
    await fs.mkdir(dir, { recursive: true });
    this.logDirReady = true;
  }
}
