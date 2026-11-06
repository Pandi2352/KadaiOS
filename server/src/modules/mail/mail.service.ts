import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../../config/app.config.js';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface AdminInviteEmailOptions {
  toEmail: string;
  inviteUrl: string;
  inviterName?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly mailConfig: AppConfig['mail'];

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.mailConfig = this.config.get('mail', { infer: true });
    if (this.mailConfig.host && this.mailConfig.user) {
      this.transporter = nodemailer.createTransport({
        host: this.mailConfig.host,
        port: this.mailConfig.port,
        secure: this.mailConfig.port === 465,
        auth: {
          user: this.mailConfig.user,
          pass: this.mailConfig.pass,
        },
      });
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from = this.mailConfig.from;

    if (!this.transporter) {
      this.logger.warn(`SMTP is not configured. Email to "${options.to}" was not sent across the network.`);
      this.logger.debug(`Email subject: "${options.subject}"\n${options.text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent successfully to "${options.to}" (Subject: "${options.subject}")`);
    } catch (error) {
      this.logger.error(`Failed to send email to "${options.to}": ${error instanceof Error ? error.message : error}`);
      throw new BadGatewayException('Failed to deliver email. Please check the server SMTP configuration.');
    }
  }

  async sendAdminInvite({ toEmail, inviteUrl, inviterName }: AdminInviteEmailOptions): Promise<void> {
    const inviter = inviterName ? inviterName : 'An administrator';
    const subject = 'You have been invited to join KadaiOS as an administrator';

    const text = [
      `Hello,`,
      ``,
      `${inviter} has invited you to join KadaiOS as an administrator.`,
      ``,
      `To accept this invitation and create your admin account, please open the following link in your browser:`,
      `${inviteUrl}`,
      ``,
      `This invitation link is valid for 48 hours. If you were not expecting this invitation, you can safely ignore this email.`,
      ``,
      `KadaiOS Team`,
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="background-color: rgb(30, 81, 133); padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.02em;">
                KadaiOS
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                Administrator Invitation
              </h2>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5; color: #374151;">
                <strong>${inviter}</strong> has invited you to join <strong>KadaiOS</strong> as an administrator.
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #374151;">
                Click the button below to accept your invitation, set your password, and activate your account:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: rgb(30, 81, 133);">
                    <a href="${inviteUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #6b7280;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.4; word-break: break-all; color: rgb(30, 81, 133);">
                <a href="${inviteUrl}" target="_blank" style="color: rgb(30, 81, 133); text-decoration: underline;">
                  ${inviteUrl}
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #9ca3af;">
                This invitation link will expire in 48 hours. If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await this.sendMail({
      to: toEmail,
      subject,
      text,
      html,
    });
  }
}
