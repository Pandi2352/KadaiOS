import { CurrentPasswordField, EmailField } from '../../../common/decorators/field.decorators.js';

export class ChangeEmailDto {
  @EmailField()
  email: string;

  @CurrentPasswordField('Current password')
  currentPassword: string;
}
