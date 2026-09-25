import type { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const hotelsIndexDefinition: Omit<IndicesCreateRequest, 'index'> = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        folding: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
  mappings: {
    properties: {
      name: {
        type: 'text',
        analyzer: 'folding',
        fields: { keyword: { type: 'keyword' } },
      },
      description: { type: 'text', analyzer: 'folding' },
      address: { type: 'text', analyzer: 'folding' },
      city: {
        type: 'text',
        analyzer: 'folding',
        fields: { keyword: { type: 'keyword' } },
      },
      cityId: { type: 'keyword' },
      country: { type: 'keyword' },
      location: { type: 'geo_point' },
      amenityCodes: { type: 'keyword' },
      priceFrom: { type: 'integer' },
      maxCapacity: { type: 'integer' },
      roomTypeCount: { type: 'integer' },
      updatedAt: { type: 'date' },
    },
  },
};
