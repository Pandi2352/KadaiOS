import { CurrentPasswordField, NewPasswordField } from '../../../common/decorators/field.decorators.js';

export class ChangePasswordDto {
  @CurrentPasswordField('Current password')
  currentPassword: string;

  @NewPasswordField('New password')
  newPassword: string;
}
