import { MiddlewareObj } from '@middy/core';

import { APIGatewayEvent } from '@/types/aws';

// Adds { body: null } to the event if it is an API Gateway event and the body property is not present
export default function requestBodyNormalizer(): MiddlewareObj<APIGatewayEvent<unknown>> {
	return {
		before: (req) => {
			if (!('body' in req.event) || req.event.body === undefined) {
				req.event.body = null;
			}
		},
	};
}
