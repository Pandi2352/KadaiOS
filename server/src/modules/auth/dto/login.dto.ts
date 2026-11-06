import { CurrentPasswordField, EmailField } from '../../../common/decorators/field.decorators.js';

export class LoginDto {
  @EmailField()
  email: string;

  @CurrentPasswordField()
  password: string;
}
