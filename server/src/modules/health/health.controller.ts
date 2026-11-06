import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import mongoose, { type Connection } from 'mongoose';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { HealthResponseDto } from './dto/health-response.dto.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiEndpoint({ summary: 'Check the API and database connection', response: HealthResponseDto })
  check(): HealthResponseDto {
    const isConnected = this.connection.readyState === mongoose.ConnectionStates.connected;
    return { database: isConnected ? 'connected' : 'disconnected' };
  }
}
