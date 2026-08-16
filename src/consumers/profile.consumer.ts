import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

    if (topic === 'profile.search') {
      const { gender, profession, religion, age, area, maritalStatus, lookingFor, page = 1, limit = 12 } = data;
      
      const where: any = {};
      if (gender) where.gender = gender;
      if (lookingFor) where.gender = lookingFor;
      if (profession) where.profession = profession;
      if (religion) where.religion = religion;
      if (maritalStatus) where.maritalStatus = maritalStatus;
      if (area) where.presentAddress = area;
      
      // Age filter - parse "25-30" into range
      if (age && age.includes('-')) {
        const [minAge, maxAge] = age.split('-').map(Number);
        where.age = Between(minAge, maxAge);
      }

      const skip = (page - 1) * limit;
      
      const [profiles, total] = await this.profileRepo.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        profiles: profiles.map(p => ({
          id: p.userId?.substring(0, 8) || p.id,
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          photo: p.proPic || null,
          education: p.degreeName || '',
          degreeName: p.degreeName || '',
          university: p.university || '',
          profession: p.profession || '',
          age: p.age || 0,
          height: p.height || '',
          gender: p.gender || '',
          religion: p.religion || '',
          area: p.presentAddress || '',
          maritalStatus: p.maritalStatus || '',
          fatherProfession: p.fatherProfession || '',
          motherProfession: p.motherProfession || '',
          presentAddress: p.presentAddress || '',
          permanentAddress: p.permanentAddress || '',
          pdfUrl: null,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
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
