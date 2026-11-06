import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMAIL_MAX_LENGTH, FIELD_LIMITS, normalizePhone, PASSWORD_LIMITS, PHONE_PATTERN } from '@kadai/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

interface TextFieldOptions {
  /** Used in error messages that forms show to people, such as "Shop name is required". */
  label: string;
  example: string;
  max?: number;
}

const trimValue = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Empty optional text is treated as not provided, so it isn't stored as an empty string. */
const trimToUndefined = ({ value }: { value: unknown }) => {
  const trimmed = trimValue({ value });
  return trimmed === '' ? undefined : trimmed;
};

const textRules = (label: string, max: number) => [
  IsString({ message: `${label} must be text` }),
  MaxLength(max, { message: `${label} must be ${max} characters or fewer` }),
];

/** Required text: trimmed first, so text of only spaces fails validation. */
export const TextField = ({ label, example, max = FIELD_LIMITS.shortText }: TextFieldOptions) =>
  applyDecorators(
    ApiProperty({ example, maxLength: max }),
    Transform(trimValue),
    IsNotEmpty({ message: `${label} is required` }),
    ...textRules(label, max),
  );

export const OptionalTextField = ({ label, example, max = FIELD_LIMITS.shortText }: TextFieldOptions) =>
  applyDecorators(
    ApiPropertyOptional({ example, maxLength: max }),
    Transform(trimToUndefined),
    IsOptional(),
    ...textRules(label, max),
  );

export const OptionalPhoneField = (label = 'Phone') =>
  applyDecorators(
    ApiPropertyOptional({
      type: String,
      example: '+919000000000',
      description: 'An optional + and 10 to 15 digits. Spaces, hyphens and brackets are removed.',
    }),
    Transform(({ value }: { value: unknown }) => {
      const trimmed = trimToUndefined({ value });
      return typeof trimmed === 'string' ? normalizePhone(trimmed) : trimmed;
    }),
    IsOptional(),
    Matches(PHONE_PATTERN, { message: `${label} must have 10 to 15 digits` }),
  );

export const EmailField = () =>
  applyDecorators(
    ApiProperty({ type: String, format: 'email', example: 'name@example.com', maxLength: EMAIL_MAX_LENGTH }),
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    IsNotEmpty({ message: 'Email is required' }),
    IsEmail({}, { message: 'Email must be a valid email address' }),
    MaxLength(EMAIL_MAX_LENGTH, { message: `Email must be ${EMAIL_MAX_LENGTH} characters or fewer` }),
  );

/** A password being set. Never trimmed, because spaces can be part of a password. */
export const NewPasswordField = (label = 'Password') =>
  applyDecorators(
    ApiProperty({
      type: String,
      format: 'password',
      minLength: PASSWORD_LIMITS.min,
      maxLength: PASSWORD_LIMITS.max,
      example: 'choose-a-long-password',
    }),
    IsString({ message: `${label} is required` }),
    MinLength(PASSWORD_LIMITS.min, { message: `${label} must have at least ${PASSWORD_LIMITS.min} characters` }),
    MaxLength(PASSWORD_LIMITS.max, { message: `${label} must be ${PASSWORD_LIMITS.max} characters or fewer` }),
  );

/** A password being checked. It skips the length rules, so an older password can still log in if rules change. */
export const CurrentPasswordField = (label = 'Password') =>
  applyDecorators(
    ApiProperty({ type: String, format: 'password', example: 'your-password' }),
    IsString({ message: `${label} is required` }),
    IsNotEmpty({ message: `${label} is required` }),
    MaxLength(PASSWORD_LIMITS.max, { message: `${label} must be ${PASSWORD_LIMITS.max} characters or fewer` }),
  );

export const EnumField = <T extends string>(label: string, values: readonly T[], example: T) =>
  applyDecorators(
    ApiProperty({ enum: values, example }),
    IsIn(values, { message: `${label} must be one of: ${values.join(', ')}` }),
  );
