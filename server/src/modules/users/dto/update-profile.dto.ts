import { OptionalPhoneField, TextField } from '../../../common/decorators/field.decorators.js';

export class UpdateProfileDto {
  @TextField({ label: 'Name', example: 'Your name' })
  name: string;

  @OptionalPhoneField()
  phone?: string;
}
