import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@palki/database';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dob: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  height: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  degreeName: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  fatherProfession: string;

  @Column({ nullable: true })
  motherProfession: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  religion: string;

  @Column({ nullable: true })
  presentAddress: string;

  @Column({ nullable: true })
  permanentAddress: string;

  @Column({ nullable: true })
  registerFor: string;

  @Column({ nullable: true })
  proPic: string;
}
