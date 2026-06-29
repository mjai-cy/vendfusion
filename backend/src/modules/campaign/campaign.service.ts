import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../entities';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly repo: Repository<Campaign>,
  ) {}

  async findAll(workspaceId: string): Promise<Campaign[]> {
    return this.repo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.repo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async create(data: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.repo.create(data);
    const saved = await this.repo.save(campaign);
    this.logger.log(`Campaign created: ${saved.id} — ${saved.name}`);
    return saved;
  }

  async update(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const campaign = await this.findOne(id);
    Object.assign(campaign, data);
    return this.repo.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.repo.remove(campaign);
    this.logger.log(`Campaign deleted: ${id}`);
  }
}
