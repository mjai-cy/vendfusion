import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const { id, ...rest } = data;
    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const list = this.repo.create(isUuid ? data : rest);
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
