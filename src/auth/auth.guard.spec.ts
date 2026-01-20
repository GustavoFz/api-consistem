import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  const createContext = (headers: Record<string, string> = {}) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    }) as ExecutionContext;

  it('allows access when route is public', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    };
    const appKeyService = {
      validateApiKey: jest.fn(),
    };
    const guard = new ApiKeyGuard(reflector as any, appKeyService as any);
    const context = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(appKeyService.validateApiKey).not.toHaveBeenCalled();
  });

  it('denies when header is missing', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    const appKeyService = {
      validateApiKey: jest.fn(),
    };
    const guard = new ApiKeyGuard(reflector as any, appKeyService as any);
    const context = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('denies when api key is invalid', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    const appKeyService = {
      validateApiKey: jest.fn().mockResolvedValue(null),
    };
    const guard = new ApiKeyGuard(reflector as any, appKeyService as any);
    const context = createContext({ 'x-api-key': 'bad' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches appName when api key is valid', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    const appKeyService = {
      validateApiKey: jest.fn().mockResolvedValue('corteva'),
    };
    const guard = new ApiKeyGuard(reflector as any, appKeyService as any);
    const request = { headers: { 'x-api-key': 'ok' } };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toEqual(
      expect.objectContaining({
        appName: 'corteva',
      }),
    );
  });
});
