import type { AuthSession } from '@kadai/shared';
import { Body, Controller, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService, EMAIL_TAKEN_MESSAGE } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthSessionDto } from './dto/auth-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SessionAuthController } from './session-auth.controller.js';

@Public()
@ApiTags('Customer auth')
@Controller('auth/customer')
export class CustomerAuthController extends SessionAuthController {
  constructor(auth: AuthService, cookies: AuthCookieService) {
    super(auth, cookies, 'customer');
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiEndpoint({
    summary: 'Create a customer account',
    description: 'Logs the customer in straight away, so it returns the same session as logging in.',
    response: AuthSessionDto,
    status: HttpStatus.CREATED,
    validates: true,
    conflict: EMAIL_TAKEN_MESSAGE,
    rateLimited: true,
  })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response): Promise<AuthSession> {
    return this.deliver(response, await this.auth.registerCustomer(dto));
  }
}
