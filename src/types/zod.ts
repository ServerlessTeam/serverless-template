import Boom from '@hapi/boom';
import { z } from 'zod';

export interface ZodValidatedResponse<T extends z.ZodTypeAny> {
	type: 'success';
	data: z.infer<T>;
}

export interface ZodErrorResponse {
	type: 'error';
	error: Boom.Boom<z.ZodIssue[]>;
}
