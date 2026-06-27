import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';

@Injectable()
export class AgentConsumer {
  constructor(@InjectRepository(Agent) private readonly agentRepo: Repository<Agent>) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const roles = payload.roles || data.roles || [];
    const userId = payload.userId || data.userId || null;

    if (data.action === 'create') {
      const agent = this.agentRepo.create(data);
      const saved = await this.agentRepo.save(agent) as any;
      return { 'agent-id': saved.id, 'user-id': saved.userId, name: saved.name, email: saved.email, 'is-active': saved.isActive };
    }

    const where: any = {};
    if (!roles.includes('ADMIN') && userId) {
      where.userId = userId;
    }

    const agents = await this.agentRepo.find({ where });
    return agents.map((a: any) => ({ 'agent-id': a.id, 'user-id': a.userId, name: a.name, email: a.email, 'is-active': a.isActive }));
  }
}