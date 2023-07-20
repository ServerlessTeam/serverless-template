import Boom from '@hapi/boom';
import middy from '@middy/core';
import { z } from 'zod';

import apiGateway from '@/middlewares/apiGateway';
import { APIGatewayHandler } from '@/types/aws';
import { isZodValidated, zodValidate } from '@/utils';

import { getExampleUserById } from './utils';
import { eventSchema, responseSchema } from './validation';

// Inferring typescript type from zod schema.
type Event = z.infer<typeof eventSchema>;

type Response = z.infer<typeof responseSchema>;

const rawHandler: APIGatewayHandler<Event, Response> = async (event) => {
	const { userId } = event.queryStringParameters;
	const user = await getExampleUserById(userId);

	const validatedUser = zodValidate(responseSchema, user);
	if (!isZodValidated(validatedUser)) {
		throw Boom.badRequest(
			`Validation of user failed. ${validatedUser.error}`,
		);
	}

	return validatedUser.data;
};

export const handler = middy(rawHandler).use(
	apiGateway({
		zodValidator: {
			eventSchema,
			responseSchema,
		},
	}),
);
