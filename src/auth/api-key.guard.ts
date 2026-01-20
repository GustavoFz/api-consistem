import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppKeyService } from './app-key.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly appKeyService: AppKeyService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const value = Array.isArray(apiKey) ? apiKey[0] : apiKey;

    if (!value) {
      throw new UnauthorizedException('Missing X-API-KEY');
    }

    const appName = await this.appKeyService.validateApiKey(value);
    if (!appName) {
      throw new UnauthorizedException('Invalid X-API-KEY');
    }

    (request as Request & { appName?: string }).appName = appName;
    return true;
  }
}
