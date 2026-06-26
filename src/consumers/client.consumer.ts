import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientConsumer {
  constructor(@InjectRepository(Client) private readonly clientRepo: Repository<Client>) {}

  async handle(payload: any) {
    const clients = await this.clientRepo.find({ relations: { user: true, package: true } });
    return clients.map(c => ({
      id: c.id, userId: c.userId, packageId: c.packageId,
      startDate: c.startDate, endDate: c.endDate, status: c.status,
      user: { id: c.user?.id, email: c.user?.email, phone: c.user?.phone, name: c.user?.name, roles: c.user?.roles, state: c.user?.state },
      package: c.package,
    }));
  }
}
