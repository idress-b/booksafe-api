import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Exclusion,
} from 'typeorm';
import { Resource } from '../../resources/entities/resource.entity.js';

@Exclusion(
  `USING gist (
    "resource_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  )`,
)
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
