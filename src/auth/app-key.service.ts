import { Inject, Injectable } from '@nestjs/common';
import { APP_KEYS_REPOSITORY, AppKeysRepository } from './app-keys.repository';

@Injectable()
export class AppKeyService {
  constructor(
    @Inject(APP_KEYS_REPOSITORY)
    private readonly appKeysRepository: AppKeysRepository,
  ) { }

  async validateApiKey(apiKey: string): Promise<string | null> {
    const appKeys = await this.appKeysRepository.getAppKeys();
    const match = appKeys.find(
      (entry) => entry.apiKey === apiKey && entry.enabled !== false,
    );

    return match?.appName ?? null;
  }
}
