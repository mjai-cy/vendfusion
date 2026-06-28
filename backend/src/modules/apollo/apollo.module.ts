import { Module } from '@nestjs/common';
import { ApolloController } from './apollo.controller';
import { ApolloService } from './apollo.service';

@Module({
  controllers: [ApolloController],
  providers: [ApolloService],
  exports: [ApolloService],
})
export class ApolloModule {}
