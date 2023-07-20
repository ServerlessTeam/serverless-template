import Boom from '@hapi/boom';
import { z } from 'zod';

import { ZodErrorResponse, ZodValidatedResponse } from '@/types/zod';

import { isValid } from './validators';

export function isSchema<TSchema extends z.ZodFirstPartySchemaTypes>(
	schema: z.ZodFirstPartySchemaTypes,
	typeName: TSchema['_def']['typeName'],
): schema is TSchema {
	return schema._def.typeName === typeName;
}

export function zodToNumber(v: unknown): unknown {
	return v && Number(v);
}

export function zodValidate<T extends z.ZodTypeAny>(
	schema: T,
	event: unknown,
): ZodValidatedResponse<T> | ZodErrorResponse {
	const parsed = schema.safeParse(event);
	if (parsed.success) {
		return {
			type: 'success',
			data: parsed.data as z.infer<T>,
		} as const;
	}

	const validationError = Boom.badRequest(
		parsed.error.issues
			.map(({ path, message }) => `${path.join('.')}: ${message}`)
			.join('; '),
		parsed.error.issues,
	);
	return {
		type: 'error',
		error: validationError,
	} as const;
}

export const isZodValidated = <T extends z.ZodTypeAny>(
	response: ZodValidatedResponse<T> | ZodErrorResponse,
): response is ZodValidatedResponse<T> =>
	(response as ZodValidatedResponse<T>).type === 'success' &&
	isValid((response as ZodValidatedResponse<T>).data);
