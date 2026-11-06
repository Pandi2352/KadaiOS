import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';
import { SessionAuthController } from './session-auth.controller.js';

/** Log in, refresh and log out only. Admins can't register. They'll join by invitation. */
@ApiTags('Admin auth')
@Controller('auth/admin')
export class AdminAuthController extends SessionAuthController {
  constructor(auth: AuthService, cookies: AuthCookieService) {
    super(auth, cookies, 'admin');
  }
}
