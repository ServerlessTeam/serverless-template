import { MiddlewareObj } from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';

import { APIGatewayEvent } from '@/types/aws';

import adminAuthorizer, { AdminAuthorizerOptions } from './adminAuthorizer';
import apiGatewayResponse from './apiGatewayResponse';
import customerAuthorizer from './customerAuthorizer';
import eventLogger from './eventLogger';
import requestBodyNormalizer from './requestBodyNormalizer';
import sentry from './sentry';
import stringifyResponseBody from './stringifyResponseBody';
import zodValidator, { Options as ZodValidatorOptions } from './zodValidator';

interface Options {
	eventLogger?:
		| false
		| {
				originalEvent: boolean;
				modifiedEvent: boolean;
		  };
	requestBodyNormalizer?: boolean;
	doNotWaitForEmptyEventLoop?: boolean;
	httpHeaderNormalizer?: boolean;
	httpEventNormalizer?: boolean;
	jsonBodyParser?: boolean;
	zodValidator?: ZodValidatorOptions;
	apiGatewayResponse?: boolean;
	adminAuthorizer?: AdminAuthorizerOptions;
	customerAuthorizer?: boolean;
}

export default function apiGateway(
	options: Options = {},
): MiddlewareObj<
	APIGatewayEvent<
		unknown,
		Record<string, unknown>,
		Record<string, unknown>,
		Record<string, unknown>,
		Record<string, unknown[]>
	>
>[] {
	const middlewares: MiddlewareObj<any, any, any, any>[] = [];

	// Do not add any handlers before this one
	// It flushes the Sentry events so it needs to be invoked last
	// ("after" and "onError" are invoked in reverse)
	middlewares.push(sentry());

	if (options.apiGatewayResponse !== false) {
		middlewares.push(stringifyResponseBody());
	}

	if (options.apiGatewayResponse !== false) {
		middlewares.push(apiGatewayResponse());
	}

	if (options.eventLogger !== false && options.eventLogger?.originalEvent === true) {
		middlewares.push(
			eventLogger({
				logPrefix: 'Original event:',
			}),
		);
	}

	if (options.requestBodyNormalizer !== false) {
		middlewares.push(requestBodyNormalizer());
	}

	if (options.doNotWaitForEmptyEventLoop !== false) {
		middlewares.push(doNotWaitForEmptyEventLoop());
	}

	if (options.httpHeaderNormalizer !== false) {
		middlewares.push(httpHeaderNormalizer());
	}

	if (options.httpEventNormalizer !== false) {
		middlewares.push(httpEventNormalizer());
	}

	if (options.jsonBodyParser !== false) {
		middlewares.push(jsonBodyParser());
	}

	if (options.zodValidator) {
		middlewares.push(zodValidator(options.zodValidator));
	}

	if (options.adminAuthorizer) {
		middlewares.push(adminAuthorizer(options.adminAuthorizer));
	}

	if (options.customerAuthorizer) {
		middlewares.push(customerAuthorizer());
	}

	if (options.eventLogger !== false && options.eventLogger?.modifiedEvent !== false) {
		middlewares.push(
			eventLogger({
				logPrefix: 'Modified Event:',
			}),
		);
	}

	return middlewares as MiddlewareObj<
		APIGatewayEvent<
			unknown,
			Record<string, unknown>,
			Record<string, unknown>,
			Record<string, unknown>,
			Record<string, unknown[]>
		>
	>[];
}
