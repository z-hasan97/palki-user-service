import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@palki/database';

@Entity('agents')
export class Agent extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true, default: '' })
  clientIds: string[];
}