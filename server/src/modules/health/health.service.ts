import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { type Connection } from 'mongoose';
import type { HealthResponseDto } from './dto/health-response.dto.js';

export const DATABASE_DOWN_MESSAGE = 'Database is disconnected';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  check(): HealthResponseDto {
    if (this.connection.readyState !== mongoose.ConnectionStates.connected) {
      throw new ServiceUnavailableException(DATABASE_DOWN_MESSAGE);
    }
    return { database: 'connected' };
  }
}
