import { Module } from '@nestjs/common';

import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [ElasticsearchModule, HotelsModule],
})
export class AppModule {}
