import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ResourceType } from '../resource-type.enum.js';

@Entity({ name: 'resources' })
export class Resource {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
    enumName: 'resource_type',
  })
  type!: ResourceType;

  @Column({ type: 'integer' })
  capacity!: number;
}