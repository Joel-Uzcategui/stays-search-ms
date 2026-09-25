import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { CATALOG_SERVICE, envs } from '../config';

const clients = ClientsModule.register([
  {
    name: CATALOG_SERVICE,
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbitmqUrl],
      queue: envs.catalogQueue,
      queueOptions: { durable: true },
    },
  },
]);

@Module({
  imports: [clients],
  exports: [clients],
})
export class RabbitMQModule {}
