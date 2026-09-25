import { Injectable } from '@nestjs/common';
import type {
  QueryDslQueryContainer,
  SortCombinations,
} from '@elastic/elasticsearch/lib/api/types';

import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { SearchHotelsDto } from './dto';
import { HotelDocument } from './hotel-document';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class SearchService {
  constructor(private readonly elastic: ElasticsearchService) {}

  async search(dto: SearchHotelsDto) {
    const page = dto.page ?? DEFAULT_PAGE;
    const limit = dto.limit ?? DEFAULT_LIMIT;
    const geo = dto.lat !== undefined && dto.lon !== undefined;

    const must: QueryDslQueryContainer[] = [];
    const filter: QueryDslQueryContainer[] = [];

    if (dto.q) {
      must.push({
        multi_match: {
          query: dto.q,
          fields: ['name^3', 'city^2', 'description', 'address'],
          fuzziness: 'AUTO',
        },
      });
    }

    if (geo) {
      filter.push({
        geo_distance: {
          distance: `${dto.radiusKm ?? 5}km`,
          location: { lat: dto.lat!, lon: dto.lon! },
        },
      });
    } else {
      if (dto.country) {
        filter.push({ term: { country: dto.country } });
      }

      if (dto.cityId) {
        filter.push({ term: { cityId: dto.cityId } });
      }
    }

    if (dto.priceMin !== undefined || dto.priceMax !== undefined) {
      filter.push({
        range: { priceFrom: { gte: dto.priceMin, lte: dto.priceMax } },
      });
    }

    if (dto.guests !== undefined) {
      filter.push({ range: { maxCapacity: { gte: dto.guests } } });
    }

    for (const code of dto.amenities ?? []) {
      filter.push({ term: { amenityCodes: code } });
    }

    const sort: SortCombinations[] = geo
      ? [
          {
            _geo_distance: {
              location: { lat: dto.lat!, lon: dto.lon! },
              order: 'asc',
              unit: 'km',
            },
          },
        ]
      : dto.q
        ? ['_score']
        : [{ 'name.keyword': 'asc' }];

    const result = await this.elastic.client.search<HotelDocument>({
      index: this.elastic.alias,
      from: (page - 1) * limit,
      size: limit,
      track_total_hits: true,
      query: { bool: { must, filter } },
      sort,
    });

    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    return {
      data: result.hits.hits.map((hit) => ({
        ...hit._source!,
        distanceKm: geo ? Number((hit.sort?.[0] as number).toFixed(2)) : null,
      })),
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }
}
