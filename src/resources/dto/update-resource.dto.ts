import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto.js';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
