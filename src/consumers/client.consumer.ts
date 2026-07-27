import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientStatus } from '../entities/client.entity';

@Injectable()
export class ClientConsumer {
  constructor(@InjectRepository(Client) private readonly clientRepo: Repository<Client>) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const topic = payload.commandType || data.commandType || '';
    const userId = data.userId || payload.userId || null;
    const roles = payload.roles || [];

    if (topic === 'client.create') {
      // Find the package by name
      const packageName = data.plan || data.packageName;
      const durationDays = data.durationDays || 365;
      
      const client = this.clientRepo.create({
        userId: userId,
        packageId: data.packageId,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        status: ClientStatus.ACTIVE,
      });
      const saved = await this.clientRepo.save(client);
      return {
        'client-id': saved.id,
        'user-id': saved.userId,
        'package-id': saved.packageId,
        'start-date': saved.startDate,
        'end-date': saved.endDate,
        'client-status': saved.status,
      };
    }

    if (topic === 'client.findAll') {
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

    if (topic === 'client.findOne') {
      const client = await this.clientRepo.findOne({ where: { userId, id: data.id } as any, relations: { user: true, package: true } });
      return client ? {
        'client-id': client.id, 'user-id': client.userId, 'package-id': client.packageId,
        'start-date': client.startDate, 'end-date': client.endDate, 'client-status': client.status,
        user: { 'user-id': client.user?.id, email: client.user?.email, phone: client.user?.phone, name: client.user?.name },
        package: client.package,
      } : null;
    }

    // Default: return all clients for the user
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
