import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { QueryFailedError, Repository } from 'typeorm';
import { Resource } from '../resources/entities/resource.entity.js';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @InjectRepository(Resource)
    private readonly resourcesRepository: Repository<Resource>,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    // on vérifie la cohérence des dates
    if (createReservationDto.startAt >= createReservationDto.endAt) {
      throw new BadRequestException('startDate must be before endDate');
    }
    // on récupère la resource
    const resource = await this.resourcesRepository.findOneBy({
      id: createReservationDto.resourceId,
    });
    if (!resource) {
      throw new NotFoundException(
        `Resource with Id ${createReservationDto.resourceId} not found`,
      );
    }

    const reservation = this.reservationsRepository.create({
      resource,
      startAt: createReservationDto.startAt,
      endAt: createReservationDto.endAt,
    });
    try {
      return await this.reservationsRepository.save(reservation);
    } catch (error) {
      const databaseError = error as { code?: string };

      if (error instanceof QueryFailedError && databaseError.code === '23P01') {
        throw new ConflictException(
          'This resource is already reserved for that time range',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: { resource: true },
      order: { id: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} reservation`;
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }
}
