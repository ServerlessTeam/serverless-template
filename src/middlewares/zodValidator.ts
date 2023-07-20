import { MiddlewareObj } from '@middy/core';
import { z } from 'zod';

import { APIGatewayResponseExtended, isErrorResponse } from '@/utils/aws';
import { isSchema, zodValidate } from '@/utils/zod';

export interface Options {
	eventSchema: z.ZodFirstPartySchemaTypes;
	responseSchema?: z.ZodTypeAny;
}

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

			const validationResult = zodValidate(eventSchema, req.event);
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

				const validationResult = zodValidate(responseSchema, response);
				if (validationResult.type === 'error') {
					validationResult.error.name = 'ResponseValidationError';
					throw validationResult.error;
				}
			}
		},
	};
}
