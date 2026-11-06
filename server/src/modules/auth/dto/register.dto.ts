import {
  EmailField,
  NewPasswordField,
  OptionalPhoneField,
  TextField,
} from '../../../common/decorators/field.decorators.js';

export class RegisterDto {
  @TextField({ label: 'Name', example: 'Your name' })
  name: string;

  @EmailField()
  email: string;

  @OptionalPhoneField()
  phone?: string;

  @NewPasswordField()
  password: string;
}
