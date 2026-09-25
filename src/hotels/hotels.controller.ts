import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { SearchHotelsDto } from './dto';
import type { HotelChangedEvent } from './hotel-document';
import { IndexerService } from './indexer.service';
import { SearchService } from './search.service';

@Controller()
export class HotelsController {
  constructor(
    private readonly search: SearchService,
    private readonly indexer: IndexerService,
  ) {}

  @MessagePattern('search.hotel.search')
  find(@Payload() dto: SearchHotelsDto) {
    return this.search.search(dto);
  }

  @MessagePattern('search.index.rebuild')
  rebuild() {
    return this.indexer.rebuild();
  }

  @EventPattern('catalog.hotel.changed')
  changed(@Payload() hotel: HotelChangedEvent) {
    return this.indexer.apply(hotel);
  }
}
