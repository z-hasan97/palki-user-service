import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileConsumer {
  constructor(@InjectRepository(Profile) private readonly profileRepo: Repository<Profile>) {}

  async handle(payload: any) {
    const data = payload.payload || payload.data || {};
    const topic = payload.commandType || '';

    if (topic === 'profile.create') {
      const userId = data.userId;
      if (!userId) return { error: 'userId is required' };

      const saved = await this.profileRepo.save({
        userId, firstName: data.firstName, lastName: data.lastName,
        dob: data.dob, age: data.age, gender: data.gender,
        height: data.height, phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp, maritalStatus: data.maritalStatus,
        profession: data.profession, designation: data.designation,
        degreeName: data.degreeName, university: data.university,
        fatherProfession: data.fatherProfession, motherProfession: data.motherProfession,
        nationality: data.nationality, religion: data.religion,
        presentAddress: data.presentAddress, permanentAddress: data.permanentAddress,
        registerFor: data.registerFor, proPic: data.proPic,
      });
      return { profileId: saved.id, userId: saved.userId };
    }

    if (topic === 'profile.get') {
      return this.profileRepo.findOne({ where: { userId: data.userId } as any });
    }

    if (topic === 'profile.update') {
      await this.profileRepo.update({ userId: data.userId } as any, {
        firstName: data.firstName, lastName: data.lastName,
        dob: data.dob, age: data.age, gender: data.gender,
        height: data.height, phoneNumber: data.phoneNumber,
        whatsapp: data.whatsapp, maritalStatus: data.maritalStatus,
        profession: data.profession, designation: data.designation,
        degreeName: data.degreeName, university: data.university,
        fatherProfession: data.fatherProfession, motherProfession: data.motherProfession,
        nationality: data.nationality, religion: data.religion,
        presentAddress: data.presentAddress, permanentAddress: data.permanentAddress,
        registerFor: data.registerFor, proPic: data.proPic,
      });
      return this.profileRepo.findOne({ where: { userId: data.userId } as any });
    }

    return null;
  }
}
