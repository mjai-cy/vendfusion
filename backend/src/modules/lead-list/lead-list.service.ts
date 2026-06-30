import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { LeadList } from '../../entities';

@Injectable()
export class LeadListService {
  private readonly logger = new Logger(LeadListService.name);

  constructor(
    @InjectRepository(LeadList)
    private readonly repo: Repository<LeadList>,
  ) {}

  async findAll(workspaceId: string): Promise<LeadList[]> {
    return this.repo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LeadList> {
    const list = await this.repo.findOne({ where: { id } });
    if (!list) throw new NotFoundException(`LeadList ${id} not found`);
    return list;
  }

  async create(data: Partial<LeadList>): Promise<LeadList> {
    const createData = { ...data };
    if (!createData.id) createData.id = crypto.randomUUID();
    const list = this.repo.create(createData as LeadList);
    const saved = await this.repo.save(list);
    this.logger.log(`LeadList created: ${saved.id} — ${saved.name}`);
    return saved;
  }

  async update(id: string, data: Partial<LeadList>): Promise<LeadList> {
    const list = await this.findOne(id);
    Object.assign(list, data);
    return this.repo.save(list);
  }

  async remove(id: string): Promise<void> {
    const list = await this.findOne(id);
    await this.repo.remove(list);
    this.logger.log(`LeadList deleted: ${id}`);
  }
}
