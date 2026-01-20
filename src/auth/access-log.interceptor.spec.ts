import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, of, throwError } from 'rxjs';
import { AccessLogInterceptor } from './access-log.interceptor';

jest.mock('fs/promises', () => ({
  appendFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('AccessLogInterceptor', () => {
  const makeContext = (statusCode: number, appName?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/price-tables',
          ip: '127.0.0.1',
          appName,
        }),
        getResponse: () => ({
          statusCode,
        }),
      }),
    }) as ExecutionContext;

  it('logs access details on success', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('/tmp/api-access.log'),
    } as ConfigService;
    const interceptor = new AccessLogInterceptor(configService);
    const context = makeContext(201, 'rical');
    const next: CallHandler = {
      handle: () => of('ok'),
    };

    await lastValueFrom(interceptor.intercept(context, next));
    await flushPromises();

    const fsPromises = await import('fs/promises');
    expect(fsPromises.appendFile).toHaveBeenCalledTimes(1);
    const logLine = (fsPromises.appendFile as jest.Mock).mock.calls[0][1];
    expect(logLine).toContain('"appName":"rical"');
    expect(logLine).toContain('"statusCode":201');
  });

  it('logs access details on error', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('/tmp/api-access.log'),
    } as ConfigService;
    const interceptor = new AccessLogInterceptor(configService);
    const context = makeContext(500);
    const next: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    };

    await expect(
      lastValueFrom(interceptor.intercept(context, next)),
    ).rejects.toThrow('boom');
    await flushPromises();

    const fsPromises = await import('fs/promises');
    expect(fsPromises.appendFile).toHaveBeenCalled();
  });
});
