import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/app.config.js';
import { MailService } from './mail.service.js';

describe('MailService', () => {
  it('initializes without throwing when mail is not configured', () => {
    const config = {
      get: vi.fn().mockReturnValue({
        host: '',
        port: 587,
        user: '',
        pass: '',
        from: 'KadaiOS <no-reply@kadaios.test>',
      }),
    } as unknown as ConfigService<AppConfig, true>;

    const service = new MailService(config);
    expect(service).toBeDefined();
  });

  it('logs a warning and returns safely when sending mail without transporter', async () => {
    const config = {
      get: vi.fn().mockReturnValue({
        host: '',
        port: 587,
        user: '',
        pass: '',
        from: 'KadaiOS <no-reply@kadaios.test>',
      }),
    } as unknown as ConfigService<AppConfig, true>;

    const service = new MailService(config);
    await expect(
      service.sendAdminInvite({
        toEmail: 'test@example.com',
        inviteUrl: 'http://localhost:3000/accept-invite?token=123',
        inviterName: 'Admin',
      }),
    ).resolves.toBeUndefined();
  });
});
