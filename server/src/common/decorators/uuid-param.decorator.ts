import { Param, ParseUUIDPipe } from '@nestjs/common';

/** Route param that must be a valid UUID. Anything else returns 400. */
export const UuidParam = (name = 'id'): ParameterDecorator => Param(name, ParseUUIDPipe);
