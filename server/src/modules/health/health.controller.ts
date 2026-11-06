import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { type Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const isConnected = this.connection.readyState === mongoose.ConnectionStates.connected;
    return { database: isConnected ? 'connected' : 'disconnected' };
  }
}
