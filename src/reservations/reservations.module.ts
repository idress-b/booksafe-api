import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';
import { Resource } from '../resources/entities/resource.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Resource])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}