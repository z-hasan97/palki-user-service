import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientConsumer {
  constructor(@InjectRepository(Client) private readonly clientRepo: Repository<Client>) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const userId = data.userId || payload.userId || null;
    const roles = payload.roles || [];

    // Admin sees all, users see only their own
    const where: any = {};
    if (!roles.includes('ADMIN') && userId) {
      where.userId = userId;
    }

    const clients = await this.clientRepo.find({ where, relations: { user: true, package: true } });
    return clients.map(c => ({
      'client-id': c.id, 'user-id': c.userId, 'package-id': c.packageId,
      'start-date': c.startDate, 'end-date': c.endDate, 'client-status': c.status,
      user: { 'user-id': c.user?.id, email: c.user?.email, phone: c.user?.phone, name: c.user?.name, roles: c.user?.roles, 'account-state': c.user?.state },
      package: c.package,
    }));
  }
}
