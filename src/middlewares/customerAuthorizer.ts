import { MiddlewareObj } from '@middy/core';
import { AWSLambda } from '@sentry/serverless';
import { eq } from 'drizzle-orm/builders/requestBuilders/where/static';

import Customers, { Customer } from '@/dbData/Customers';
import { APIGatewayEvent } from '@/types/aws';
import { CustomerJwtPayload, verifyCustomerToken } from '@/utils/authorization';
import {
	IncorrectTokenType,
	InvalidAuthTokenError,
	InvalidApiKeyError,
	MissingAuthTokenError,
} from '@/utils/boom';
import { createOrGetDbConnection } from '@/utils/db/index';

interface AuthorizedCustomer {
	id: NonNullable<Customer['id']>;
	email: CustomerJwtPayload['email'];
	phoneNumber: CustomerJwtPayload['phoneNumber'];
}

async function processApiKey(apiKey: string): Promise<{
	sub: string;
	email: string | undefined;
	phone: string | undefined;
	type: 'apiKey';
}> {
	const db = await createOrGetDbConnection();
	const customers = new Customers(db);

	const [customer] = await customers.select().where(eq(customers.apiKey, apiKey)).execute();

	if (!customer || customer.apiAccessStatus !== 'approved') {
		throw new InvalidApiKeyError('Invalid API key');
	}

	return {
		sub: customer.id!.toString(),
		email: customer.email,
		phone: customer.phoneNumber,
		type: 'apiKey',
	};
}

export default function customerAuthorizer(): MiddlewareObj<APIGatewayEvent<unknown>> {
	return {
		before: async (request) => {
			const apiKey = request.event.headers['x-api-key'];
			const [bearer, token] = request.event.headers.authorization?.split(' ') ?? [];
			let payload: Awaited<
				ReturnType<typeof processApiKey> | ReturnType<typeof verifyCustomerToken>
			>;

			if (apiKey) {
				payload = await processApiKey(apiKey);
			} else {
				if (bearer !== 'Bearer' || !token) {
					throw new MissingAuthTokenError('Missing authentication token');
				}

				payload = await verifyCustomerToken(token).catch((error) => {
					console.error(error);

					throw new InvalidAuthTokenError('Invalid authentication token');
				});

				if (payload.type !== 'id') {
					throw new IncorrectTokenType('Invalid authentication token type');
				}
			}

			AWSLambda.configureScope((scope) => {
				scope.setTag('user_mode', 'customer');
				scope.setUser({
					id: payload.sub,
					email: payload.email,
					phone: payload.phone,
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

export function getAuthorizedCustomer(event: APIGatewayEvent<unknown>): AuthorizedCustomer {
	const payload = event.requestContext.authorizer.claims as CustomerJwtPayload;

	return {
		id: payload.sub!,
		email: payload.email,
		phoneNumber: payload.phoneNumber,
	};
}
