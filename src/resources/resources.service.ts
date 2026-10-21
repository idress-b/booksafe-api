import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { UpdateResourceDto } from './dto/update-resource.dto.js';
import { Resource } from './entities/resource.entity.js';

@Injectable()
export class ResourcesService {

  private readonly resources: Resource[] = [];
private nextId = 1;

create(createResourceDto: CreateResourceDto): Resource {
  const resource: Resource = {
    id: this.nextId++,
    ...createResourceDto,
  };

  this.resources.push(resource);

  return resource;
}

findAll(): Resource[] {
  return this.resources;
}
 

  findOne( id: number) {
    const result = this.resources.find(x => x.id === id);
    if(!result){
      throw new NotFoundException(`Resource with id ${id} not found`);
    }
    return result;
  }

  update(id: number, updateResourceDto: UpdateResourceDto) {
    return `This action updates a #${id} resource`;
  }

  remove(id: number) {
    return `This action removes a #${id} resource`;
  }
}
