import { EmailField } from '../../../common/decorators/field.decorators.js';

export class CreateAdminInviteDto {
  @EmailField()
  email: string;
}

