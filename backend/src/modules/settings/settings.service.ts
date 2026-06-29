import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../entities';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly repo: Repository<Workspace>,
  ) {}

  async getSettings(id: string) {
    const ws = await this.repo.findOne({ where: { id } });
    if (!ws) throw new NotFoundException(`Workspace ${id} not found`);
    return {
      linkedInConnected: ws.linkedInConnected,
      linkedInWeeklyLimit: ws.linkedInWeeklyLimit,
      linkedInActiveDays: ws.linkedInActiveDays,
      autoEnrichEmails: ws.autoEnrichEmails,
      autoEnrichPhones: ws.autoEnrichPhones,
      autoGenerateMessages: ws.autoGenerateMessages,
      excludeServiceProviders: ws.excludeServiceProviders,
    };
  }

  async updateSettings(id: string, data: {
    linkedInConnected?: boolean;
    linkedInWeeklyLimit?: number;
    linkedInActiveDays?: string[];
    autoEnrichEmails?: boolean;
    autoEnrichPhones?: boolean;
    autoGenerateMessages?: boolean;
    excludeServiceProviders?: boolean;
  }) {
    const ws = await this.repo.findOne({ where: { id } });
    if (!ws) throw new NotFoundException(`Workspace ${id} not found`);
    Object.assign(ws, data);
    const saved = await this.repo.save(ws);
    this.logger.log(`Settings updated for workspace ${id}`);
    return saved;
  }
}
