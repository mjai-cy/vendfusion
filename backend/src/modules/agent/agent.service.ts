import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../../entities';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(Agent)
    private readonly repo: Repository<Agent>,
  ) {}

  async findAll(workspaceId: string): Promise<Agent[]> {
    return this.repo.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.repo.findOne({ where: { id } });
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    return agent;
  }

  async create(data: Partial<Agent>): Promise<Agent> {
    const { id, ...rest } = data;
    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const agent = this.repo.create(isUuid ? data : rest);
    const saved = await this.repo.save(agent);
    this.logger.log(`Agent created: ${saved.id} — ${saved.name}`);
    return saved;
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    const agent = await this.findOne(id);
    Object.assign(agent, data);
    return this.repo.save(agent);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    await this.repo.remove(agent);
    this.logger.log(`Agent deleted: ${id}`);
  }
}
