import Boom from '@hapi/boom';
import { MiddlewareObj } from '@middy/core';
import { AWSLambda } from '@sentry/serverless';

import { Admin } from '@/dbData/Admins';
import { APIGatewayEvent } from '@/types/aws';
import { verifyAdminToken, AdminJWTPayload } from '@/utils/authorization';

export interface AdminAuthorizerOptions {
	allowedRoles: Admin['role'][];
}

export default function adminAuthorizer(
	options: AdminAuthorizerOptions,
): MiddlewareObj<APIGatewayEvent<unknown>> {
	return {
		before: async (request) => {
			const token = request.event.headers.authorization?.split(' ')?.[1];

			if (!token) {
				throw Boom.unauthorized('Missing authentication token');
			}

			const payload = await verifyAdminToken(token).catch((error) => {
				console.error(error);

				throw Boom.unauthorized('Invalid authentication token');
			});

			if (payload.type !== 'id') {
				throw Boom.unauthorized('Invalid authentication token');
			}

			if (!options.allowedRoles.includes(payload.role)) {
				throw Boom.unauthorized();
			}

			AWSLambda.configureScope((scope) => {
				scope.setTag('user_mode', 'admin');
				scope.setUser({
					id: payload.sub,
					email: payload.email,
					role: payload.role,
				});
			});

			request.event.requestContext = {
				...request.event.requestContext,
				authorizer: {
					claims: payload,
				},
			};
		},
	};
}

export function getCurrentAdmin(event: APIGatewayEvent<unknown>): AdminJWTPayload {
	return event.requestContext.authorizer.claims as AdminJWTPayload;
}
