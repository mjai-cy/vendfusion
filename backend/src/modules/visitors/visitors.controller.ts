import { Controller, Get, Post, Patch, Delete, Body, Param, Ip, Logger } from '@nestjs/common';
import { VisitorsService, Visitor } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
  private readonly logger = new Logger(VisitorsController.name);
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post('track')
  track(
    @Body('domain') domain: string,
    @Body('pageUrl') pageUrl: string,
    @Body('pageTitle') pageTitle: string,
    @Body('source') source: string,
    @Ip() ip: string,
  ): Visitor {
    return this.visitorsService.track(domain, pageUrl, pageTitle, source || 'direct', ip);
  }

  @Get()
  findAll(): Visitor[] {
    return this.visitorsService.findAll();
  }

  @Get('stats')
  stats() {
    return this.visitorsService.getStats();
  }

  @Get(':id')
  findById(@Param('id') id: string): Visitor | undefined {
    return this.visitorsService.findById(id);
  }

  @Post(':id/enrich')
  async enrich(@Param('id') id: string): Promise<Visitor | null> {
    return this.visitorsService.enrichVisitor(id);
  }

  @Post('enrich-all')
  async enrichAll(): Promise<{ enriched: number }> {
    const count = await this.visitorsService.enrichAll();
    return { enriched: count };
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: Visitor['status']): Visitor | null {
    return this.visitorsService.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return { deleted: this.visitorsService.delete(id) };
  }
}
