import { Module } from '@nestjs/common';

import { RabbitMQModule } from '../transports/rabbitmq.module';
import { HotelsController } from './hotels.controller';
import { IndexerService } from './indexer.service';
import { SearchService } from './search.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [HotelsController],
  providers: [SearchService, IndexerService],
})
export class HotelsModule {}
