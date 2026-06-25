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
      return this.agentRepo.save(agent);
    }
    if (data.id) return this.agentRepo.findOne({ where: { id: data.id } });
    return this.agentRepo.find();
  }
}
