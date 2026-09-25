import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

import { envs } from '../config';
import { hotelsIndexDefinition } from './hotels-index';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);

  readonly client = new Client({ node: envs.elasticsearchNode });
  readonly alias = envs.hotelsAlias;

  async onModuleInit() {
    await this.waitForCluster();
    await this.ensureAlias();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async createVersionedIndex() {
    const index = `${this.alias}_${Date.now()}`;

    await this.client.indices.create({ index, ...hotelsIndexDefinition });

    return index;
  }

  async pointAliasTo(index: string) {
    const current = await this.indicesBehindAlias();

    await this.client.indices.updateAliases({
      actions: [
        ...current.map((old) => ({
          remove: { index: old, alias: this.alias },
        })),
        { add: { index, alias: this.alias } },
      ],
    });

    for (const old of current) {
      await this.client.indices.delete({ index: old });
    }

    this.logger.log(`Alias "${this.alias}" now points to ${index}`);
  }

  private async indicesBehindAlias() {
    const exists = await this.client.indices.existsAlias({ name: this.alias });

    if (!exists) {
      return [];
    }

    const found = await this.client.indices.getAlias({ name: this.alias });

    return Object.keys(found);
  }

  private async ensureAlias() {
    if ((await this.indicesBehindAlias()).length > 0) {
      return;
    }

    const index = await this.createVersionedIndex();

    await this.pointAliasTo(index);
  }

  private async waitForCluster() {
    for (let attempt = 1; attempt <= 30; attempt++) {
      try {
        await this.client.cluster.health({ wait_for_status: 'yellow' });
        this.logger.log('Elasticsearch connected');

        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error('Elasticsearch is not reachable');
  }
}
