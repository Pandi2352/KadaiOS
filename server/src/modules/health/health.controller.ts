import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { DATABASE_DOWN_MESSAGE, HealthService } from './health.service.js';

@Public()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Check the API and database connection',
    response: HealthResponseDto,
    unavailable: DATABASE_DOWN_MESSAGE,
  })
  check(): HealthResponseDto {
    return this.health.check();
  }
}
