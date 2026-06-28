import { Controller, Get, Post, Patch, Delete, Body, Param, ParseBoolPipe } from '@nestjs/common';
import { SequencesService, SequenceStep, Sequence } from './sequences.service';

@Controller('sequences')
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}

  @Post()
  create(@Body('name') name: string, @Body('campaignId') campaignId: string): Sequence {
    return this.sequencesService.create(name, campaignId);
  }

  @Get()
  findAll(): Sequence[] {
    return this.sequencesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Sequence | undefined {
    return this.sequencesService.findById(id);
  }

  @Get('campaign/:campaignId')
  findByCampaign(@Param('campaignId') campaignId: string): Sequence[] {
    return this.sequencesService.findByCampaign(campaignId);
  }

  @Patch(':id/steps')
  updateSteps(@Param('id') id: string, @Body('steps') steps: SequenceStep[]): Sequence | null {
    return this.sequencesService.updateSteps(id, steps);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: Sequence['status']): Sequence | null {
    return this.sequencesService.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.sequencesService.delete(id) };
  }
}
