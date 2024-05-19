import { registerAs } from '@nestjs/config';

export const apiConfig = registerAs('api', () => ({
  port: process.env.API_PORT,
}));
