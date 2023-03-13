import * as Boom from '@hapi/boom';
import { MiddlewareObj } from '@middy/core';
import { z } from 'zod';

import { APIGatewayResponseExtended, isErrorResponse } from '@/utils/aws';
import { isSchema } from '@/utils/zod';

export interface Options {
	eventSchema: z.ZodFirstPartySchemaTypes;
	responseSchema?: z.ZodTypeAny;
}

// Zod validation.
export default function zodValidator({
	eventSchema: _eventSchema,
	responseSchema,
}: Options): MiddlewareObj {
	return {
		before: async (req) => {
			let eventSchema;
			// Allow unknown fields if event is validated as object
			if (
				isSchema<z.SomeZodObject>(
					_eventSchema,
					z.ZodFirstPartyTypeKind.ZodObject,
				)
			) {
				eventSchema = _eventSchema.passthrough();
			} else {
				eventSchema = _eventSchema;
			}

			const validationResult = validate(eventSchema, req.event);
			if (validationResult.type === 'success') {
				req.event = validationResult.data;
			} else {
				validationResult.error.name = 'RequestValidationError';
				throw validationResult.error;
			}
		},
		after: (req) => {
			if (responseSchema) {
				let response;
				if (req.response instanceof APIGatewayResponseExtended) {
					if (isErrorResponse(req.response)) {
						return;
					}

					response = req.response.body;
				} else {
					response = req.response;
				}

				const validationResult = validate(responseSchema, response);
				if (validationResult.type === 'error') {
					validationResult.error.name = 'ResponseValidationError';
					throw validationResult.error;
				}
			}
		},
	};
}

function validate(schema: z.ZodTypeAny, event: unknown) {
	const parsed = schema.safeParse(event);
	if (parsed.success) {
		return {
			type: 'success',
			data: parsed.data,
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
