import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadList } from '../../entities';
import { LeadListController } from './lead-list.controller';
import { LeadListService } from './lead-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadList])],
  controllers: [LeadListController],
  providers: [LeadListService],
  exports: [LeadListService],
})
export class LeadListModule {}
