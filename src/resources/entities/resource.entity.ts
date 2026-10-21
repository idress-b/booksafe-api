import { ResourceType } from '../resource-type.enum.js';

export class Resource {
  id: number;
  name: string;
  type: ResourceType;
  capacity: number;
}
