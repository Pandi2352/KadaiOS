import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FIELD_LIMITS, normalizePhone, PHONE_PATTERN } from '@kadai/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

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

export const EnumField = <T extends string>(label: string, values: readonly T[], example: T) =>
  applyDecorators(
    ApiProperty({ enum: values, example }),
    IsIn(values, { message: `${label} must be one of: ${values.join(', ')}` }),
  );
