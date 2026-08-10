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

    if (topic === 'profile.search') {
      const { gender, profession, religion, age, area, maritalStatus, lookingFor, page = 1, limit = 12 } = data;
      
      // Build where conditions
      const where: any = {};
      if (gender) where.gender = gender;
      if (lookingFor) where.gender = lookingFor; // "lookingFor" maps to gender
      if (profession) where.profession = profession;
      if (religion) where.religion = religion;
      if (maritalStatus) where.maritalStatus = maritalStatus;
      if (area) where.presentAddress = area;
      
      // Age filter: format "25-30" -> minAge 25, maxAge 30
      if (age && age.includes('-')) {
        const [minAge, maxAge] = age.split('-').map(Number);
        // TypeORM doesn't support between directly in find options easily
        // We'll handle this differently
      }

      const skip = (page - 1) * limit;
      
      const [profiles, total] = await this.profileRepo.findAndCount({
        where,
        relations: { user: true },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      // Filter by age in JS if needed (TypeORM limitation)
      let filteredProfiles = profiles;
      if (age && age.includes('-')) {
        const [minAge, maxAge] = age.split('-').map(Number);
        filteredProfiles = profiles.filter(p => p.age >= minAge && p.age <= maxAge);
      }

      return {
        profiles: filteredProfiles.map(p => ({
          id: p.userId?.substring(0, 8) || p.id,
          photo: p.proPic || null,
          education: p.degreeName || '',
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
