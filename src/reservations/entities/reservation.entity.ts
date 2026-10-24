import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Resource } from '../../resources/entities/resource.entity.js';

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Resource, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'resource_id' })
  resource!: Resource;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
