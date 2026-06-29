import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { LeadListService } from './lead-list.service';

@Controller('lead-lists')
export class LeadListController {
  constructor(private readonly service: LeadListService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.service.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
