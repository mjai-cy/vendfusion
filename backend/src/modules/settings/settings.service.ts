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
    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return {
        linkedInConnected: false,
        linkedInWeeklyLimit: 100,
        linkedInActiveDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        autoEnrichEmails: false,
        autoEnrichPhones: false,
        autoGenerateMessages: false,
        excludeServiceProviders: false,
      };
    }
    const ws = await this.repo.findOne({ where: { id } });
    if (!ws) {
      return {
        linkedInConnected: false,
        linkedInWeeklyLimit: 100,
        linkedInActiveDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        autoEnrichEmails: false,
        autoEnrichPhones: false,
        autoGenerateMessages: false,
        excludeServiceProviders: false,
      };
    }
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
    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      this.logger.warn(`Ignoring settings update for non-UUID workspace ID: ${id}`);
      return { success: true };
    }
    const ws = await this.repo.findOne({ where: { id } });
    if (!ws) {
      this.logger.warn(`Workspace ${id} not found for settings update`);
      return { success: false };
    }
    Object.assign(ws, data);
    const saved = await this.repo.save(ws);
    this.logger.log(`Settings updated for workspace ${id}`);
    return saved;
  }
}
