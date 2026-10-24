import { Test, TestingModule } from '@nestjs/testing';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { ResourcesController } from './resources.controller.js';
import { ResourceType } from './resource-type.enum.js';
import { ResourcesService } from './resources.service.js';

describe('ResourcesController', () => {
  let controller: ResourcesController;

  const resourcesService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourcesService,
          useValue: resourcesService,
        },
      ],
    }).compile();

    controller = module.get<ResourcesController>(ResourcesController);
  });

  it('delegates resource creation to the service', async () => {
    const dto: CreateResourceDto = {
      name: 'Salle Atlas',
      type: ResourceType.MEETING_ROOM,
      capacity: 8,
    };
    const resource = { id: 1, ...dto };
    resourcesService.create.mockResolvedValue(resource);

    await expect(controller.create(dto)).resolves.toBe(resource);
    expect(resourcesService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates listing resources to the service', async () => {
    const resources = [{ id: 1 }, { id: 2 }];
    resourcesService.findAll.mockResolvedValue(resources);

    await expect(controller.findAll()).resolves.toBe(resources);
    expect(resourcesService.findAll).toHaveBeenCalledOnce();
  });

  it('converts the id before delegating resource lookup', async () => {
    const resource = { id: 1 };
    resourcesService.findOne.mockResolvedValue(resource);

    await expect(controller.findOne('1')).resolves.toBe(resource);
    expect(resourcesService.findOne).toHaveBeenCalledWith(1);
  });
});
