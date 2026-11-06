import { NewPasswordField, OptionalPhoneField, TextField } from '../../../common/decorators/field.decorators.js';

export class AcceptAdminInviteDto {
  @TextField({ label: 'Invite token', example: 'd3f4a1...' })
  token: string;

  @TextField({ label: 'Name', example: 'Your name' })
  name: string;

  @NewPasswordField()
  password: string;

  @OptionalPhoneField()
  phone?: string;
}
