import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@palki/database';

export enum UserState {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserState, default: UserState.PENDING_VERIFICATION })
  state: UserState;

  @Column({ type: 'jsonb', default: '["CLIENT"]' })
  roles: string[];

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];

  @Column({ default: 0 })
  failedLogins: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  // Approval fields for agent-submitted clients
  @Column({ type: 'enum', enum: ApprovalStatus, nullable: true })
  approvalStatus: ApprovalStatus;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  submittedByAgentId: string;
}