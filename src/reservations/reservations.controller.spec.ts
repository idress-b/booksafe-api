import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const reservationsService = {
    create: vi.fn(),
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: reservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('delegates reservation creation to the service', async () => {
    const dto: CreateReservationDto = {
      resourceId: 1,
      startAt: new Date('2026-10-25T09:00:00Z'),
      endAt: new Date('2026-10-25T10:00:00Z'),
    };
    const reservation = { id: 1, ...dto };
    reservationsService.create.mockResolvedValue(reservation);

    await expect(controller.create(dto)).resolves.toBe(reservation);
    expect(reservationsService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates listing reservations to the service', async () => {
    const reservations = [{ id: 1 }, { id: 2 }];
    reservationsService.findAll.mockResolvedValue(reservations);

    await expect(controller.findAll()).resolves.toBe(reservations);
    expect(reservationsService.findAll).toHaveBeenCalledOnce();
  });
});
