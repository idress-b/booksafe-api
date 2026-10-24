import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError } from 'typeorm';
import { Resource } from '../resources/entities/resource.entity.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const reservationsRepository = {
    create: vi.fn(),
    save: vi.fn(),
  };

  const resourcesRepository = {
    findOneBy: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
        {
          provide: getRepositoryToken(Resource),
          useValue: resourcesRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('translates a PostgreSQL exclusion violation into a conflict', async () => {
    const dto: CreateReservationDto = {
      resourceId: 1,
      startAt: new Date('2026-10-25T09:30:00Z'),
      endAt: new Date('2026-10-25T10:30:00Z'),
    };

    const resource = { id: 1 } as Resource;
    const reservation = { resource } as Reservation;

    resourcesRepository.findOneBy.mockResolvedValue(resource);
    reservationsRepository.create.mockReturnValue(reservation);

    const driverError = Object.assign(new Error('exclusion violation'), {
      code: '23P01',
    });

    reservationsRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT INTO reservations ...', [], driverError),
    );

    await expect(service.create(dto)).rejects.toMatchObject({
      message: 'This resource is already reserved for that time range',
      status: 409,
    });
    expect(reservationsRepository.save).toHaveBeenCalledWith(reservation);
  });

  it('rethrows database errors that are not exclusion violations', async () => {
    const dto: CreateReservationDto = {
      resourceId: 1,
      startAt: new Date('2026-10-25T09:30:00Z'),
      endAt: new Date('2026-10-25T10:30:00Z'),
    };

    const resource = { id: 1 } as Resource;
    const reservation = { resource } as Reservation;

    resourcesRepository.findOneBy.mockResolvedValue(resource);
    reservationsRepository.create.mockReturnValue(reservation);

    const driverError = Object.assign(new Error('unexpected database error'), {
      code: '23505',
    });
    const databaseError = new QueryFailedError(
      'INSERT INTO reservations ...',
      [],
      driverError,
    );

    reservationsRepository.save.mockRejectedValue(databaseError);

    await expect(service.create(dto)).rejects.toBe(databaseError);
  });
});
