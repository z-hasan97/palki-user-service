import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UserService } from '../services/user.service';

@Injectable()
export class UserConsumer {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Profile) private readonly profileRepo: Repository<Profile>,
  ) {}

  async handle(payload: any) {
    const data = payload.payload || payload;
    const id = data.userId || data.sub || data.id;

    if (!id) throw new Error('USER_NOT_FOUND');

    // Update user fields
    if (data.name || data.email || data.phone) {
      await this.userService.updateProfile(id, { name: data.name, email: data.email, phone: data.phone } as any);
    }

    // Update profile fields (proPic, etc.)
    if (data.proPic) {
      const profile = await this.profileRepo.findOne({ where: { userId: id } });
      if (profile) {
        profile.proPic = data.proPic;
        await this.profileRepo.save(profile);
      }
    }

    const user = await this.userService.findById(id);
    if (!user) throw new Error('USER_NOT_FOUND');

    const profile = await this.profileRepo.findOne({ where: { userId: id } });

    return {
      'user-id': user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      roles: user.roles,
      'account-state': user.state,
      publicId: (user as any).publicId || null,
      profile: profile ? Object.fromEntries(Object.entries(profile).filter(([_, v]) => v !== null)) : null,
    };
  }
}
