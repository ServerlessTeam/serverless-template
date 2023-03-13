import Boom from '@hapi/boom';
import { MiddlewareObj } from '@middy/core';

import { APIGatewayEvent } from '@/types/aws';
import { isValid, isValidString } from '@/utils';

// Validates that current user has all required data to trigger this lambda.
export default function validateUserInfo(): MiddlewareObj<
	APIGatewayEvent<unknown>
> {
	return {
		before: (req) => {
			const authParams = req.event.requestContext.authorizer.claims;

			if (!isValid(authParams)) {
				throw Boom.unauthorized('Missing authentication params');
			}

			const userId = authParams.sub;

			if (!isValidString(userId)) {
				throw Boom.unauthorized('Missing user identifier');
			}
		},
	};
}
