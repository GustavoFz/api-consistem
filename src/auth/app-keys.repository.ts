import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

export type AppKeyRecord = {
  appName: string;
  apiKey: string;
  enabled?: boolean;
};

export interface AppKeysRepository {
  getAppKeys(): Promise<AppKeyRecord[]>;
}

export const APP_KEYS_REPOSITORY = Symbol('APP_KEYS_REPOSITORY');

@Injectable()
export class FileAppKeysRepository implements AppKeysRepository {
  private cache: AppKeyRecord[] = [];
  private lastMtimeMs: number | null = null;

  constructor(private readonly configService: ConfigService) { }

  async getAppKeys(): Promise<AppKeyRecord[]> {
    const filePath = this.configService.get<string>('APP_KEYS_FILE');
    if (!filePath) {
      throw new InternalServerErrorException('APP_KEYS_FILE is not configured');
    }

    try {
      const stat = await fs.stat(filePath);
      if (!this.lastMtimeMs || stat.mtimeMs > this.lastMtimeMs) {
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        const apps = Array.isArray(parsed) ? parsed : parsed?.apps;

        if (!Array.isArray(apps)) {
          throw new InternalServerErrorException(
            'APP_KEYS_FILE must contain an array of apps',
          );
        }

        this.cache = apps.map((app) => ({
          appName: String(app.appName),
          apiKey: String(app.apiKey),
          enabled: app.enabled === undefined ? true : Boolean(app.enabled),
        }));
        this.lastMtimeMs = stat.mtimeMs;
      }

      return this.cache;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      const fileName = filePath ? path.basename(filePath) : 'unknown';
      throw new InternalServerErrorException(
        `Failed to load app keys from ${fileName}`,
      );
    }
  }
}
