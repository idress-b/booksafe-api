import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateResourceDto } from './dto/create-resource.dto.js';
import { Resource } from './entities/resource.entity.js';
import { ResourceType } from './resource-type.enum.js';
import { ResourcesService } from './resources.service.js';

describe('ResourcesService', () => {
  let service: ResourcesService;

  const resourcesRepository = {
    create: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: getRepositoryToken(Resource),
          useValue: resourcesRepository,
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
  });

  it('creates and saves a resource', async () => {
    const dto: CreateResourceDto = {
      name: 'Salle Atlas',
      type: ResourceType.MEETING_ROOM,
      capacity: 8,
    };
    const resource = { id: 1, ...dto } as Resource;

    resourcesRepository.create.mockReturnValue(resource);
    resourcesRepository.save.mockResolvedValue(resource);

    await expect(service.create(dto)).resolves.toBe(resource);
    expect(resourcesRepository.create).toHaveBeenCalledWith(dto);
    expect(resourcesRepository.save).toHaveBeenCalledWith(resource);
  });

  it('lists resources ordered by id', async () => {
    const resources = [{ id: 1 }, { id: 2 }] as Resource[];
    resourcesRepository.find.mockResolvedValue(resources);

    await expect(service.findAll()).resolves.toBe(resources);
    expect(resourcesRepository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
  });

  it('returns a resource found by id', async () => {
    const resource = { id: 1 } as Resource;
    resourcesRepository.findOneBy.mockResolvedValue(resource);

    await expect(service.findOne(1)).resolves.toBe(resource);
    expect(resourcesRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('throws when the resource does not exist', async () => {
    resourcesRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(42)).rejects.toMatchObject({
      message: 'Resource with id 42 not found',
      status: 404,
    });
    expect(resourcesRepository.findOneBy).toHaveBeenCalledWith({ id: 42 });
  });
});
