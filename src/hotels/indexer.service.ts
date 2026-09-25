import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CATALOG_SERVICE } from '../config';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { HotelChangedEvent, isSearchable, toDocument } from './hotel-document';

const REBUILD_PAGE_SIZE = 200;

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private readonly elastic: ElasticsearchService,
    @Inject(CATALOG_SERVICE) private readonly catalogClient: ClientProxy,
  ) {}

  async apply(hotel: HotelChangedEvent) {
    if (!isSearchable(hotel)) {
      await this.remove(hotel.id);

      return;
    }

    await this.elastic.client.index({
      index: this.elastic.alias,
      id: hotel.id,
      document: toDocument(hotel),
    });
  }

  async rebuild() {
    const index = await this.elastic.createVersionedIndex();

    let page = 1;
    let indexed = 0;

    for (;;) {
      const batch = await firstValueFrom(
        this.catalogClient.send<HotelChangedEvent[]>(
          'catalog.hotel.findAllForIndex',
          { page, limit: REBUILD_PAGE_SIZE },
        ),
      );

      if (batch.length === 0) {
        break;
      }

      const searchable = batch.filter(isSearchable);

      if (searchable.length > 0) {
        await this.elastic.client.bulk({
          index,
          refresh: true,
          operations: searchable.flatMap((hotel) => [
            { index: { _id: hotel.id } },
            toDocument(hotel),
          ]),
        });

        indexed += searchable.length;
      }

      if (batch.length < REBUILD_PAGE_SIZE) {
        break;
      }

      page++;
    }

    await this.elastic.pointAliasTo(index);
    this.logger.log(`Rebuilt index with ${indexed} hotels`);

    return { indexed };
  }

  private async remove(id: string) {
    try {
      await this.elastic.client.delete({ index: this.elastic.alias, id });
    } catch (error) {
      if (!this.isNotFound(error)) {
        throw error;
      }
    }
  }

  private isNotFound(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      error.statusCode === 404
    );
  }
}
