import { ConnectionOptions } from 'typeorm';

export const pgConfig: ConnectionOptions = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'pinkbean',
  database: 'orientalsalad',
  logging: ['error'],
  synchronize: true,
  entities: ['src/core/entity/*.ts'],
};
