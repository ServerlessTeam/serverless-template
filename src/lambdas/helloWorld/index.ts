import middy from '@middy/core';
import { z } from 'zod';

import apiGateway from '@/middlewares/apiGateway';
import { APIGatewayHandler } from '@/types/aws';

import { getExampleUserById } from './utils';
import { eventSchema, responseSchema } from './validation';

// Getting typescript type from zod schema.
type Event = z.infer<typeof eventSchema>;

type Response = z.infer<typeof responseSchema>;

const rawHandler: APIGatewayHandler<Event, Response> = async (event) => {
	const { userId } = event.queryStringParameters;
	const user = await getExampleUserById(userId);

	return user;
};

export const handler = middy(rawHandler).use(
	apiGateway({
		zodValidator: {
			eventSchema,
			responseSchema,
		},
	}),
);
