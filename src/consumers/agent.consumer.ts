import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';

@Injectable()
export class AgentConsumer {
  constructor(@InjectRepository(Agent) private readonly agentRepo: Repository<Agent>) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    if (data.action === 'create') {
      const agent = this.agentRepo.create(data);
      const saved = await this.agentRepo.save(agent) as any;
      return { 'agent-id': saved.id, 'user-id': saved.userId, name: saved.name, email: saved.email, 'is-active': saved.isActive };
    }
    const agents = await this.agentRepo.find();
    return agents.map((a: any) => ({ 'agent-id': a.id, 'user-id': a.userId, name: a.name, email: a.email, 'is-active': a.isActive }));
  }
}
