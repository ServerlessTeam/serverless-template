import { z } from 'zod';

import { zodToNumber } from '@/utils';

export const eventSchema = z.object({
	queryStringParameters: z.object({
		userId: z.preprocess(zodToNumber, z.number().nonnegative()),
	}),
});

export const responseSchema = z.object({
	id: z.number(),
	email: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	avatarUrl: z.string().optional(),
});
