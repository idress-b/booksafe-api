import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Resource } from '../resources/entities/resource.entity.js';
import { Reservation } from '../reservations/entities/reservation.entity.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Resource, Reservation],
  migrations: [join(currentDirectory, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
