import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { ResourceType } from '../resource-type.enum.js';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;
}