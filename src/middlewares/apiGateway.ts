import { MiddlewareObj } from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';

import { Options as ZodValidatorOptions } from '@/middlewares/zodValidator';
import { APIGatewayEvent } from '@/types/aws';

import apiGatewayResponse from './apiGatewayResponse';
import requestBodyNormalizer from './requestBodyNormalizer';
import stringifyResponseBody from './stringifyResponseBody';
import validateUserInfo from './validateUserInfo';
import zodValidator from './zodValidator';

type Options = {
	requestBodyNormalizer: boolean;
	doNotWaitForEmptyEventLoop: boolean;
	httpHeaderNormalizer: boolean;
	jsonBodyParser: boolean;
	zodValidator: ZodValidatorOptions;
	httpEventNormalizer: boolean;
	apiGatewayResponse: boolean;
	validateUserInfo: boolean;
};

// API Gateway middleware. Transforms and validates event and response.
export default function apiGateway(
	options: Partial<Options> = {},
): MiddlewareObj<
	APIGatewayEvent<
		unknown,
		Record<string, unknown>,
		Record<string, unknown>,
		Record<string, unknown>,
		Record<string, unknown[]>
	>
>[] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const middlewareArray: MiddlewareObj<any, any, any, any>[] = [];

	if (options.apiGatewayResponse !== false) {
		middlewareArray.push(stringifyResponseBody());
		middlewareArray.push(apiGatewayResponse());
	}

	if (options.requestBodyNormalizer !== false) {
		middlewareArray.push(requestBodyNormalizer());
	}

	if (options.doNotWaitForEmptyEventLoop !== false) {
		middlewareArray.push(doNotWaitForEmptyEventLoop());
	}

	if (options.httpHeaderNormalizer !== false) {
		middlewareArray.push(httpHeaderNormalizer());
	}

	if (options.httpEventNormalizer !== false) {
		middlewareArray.push(httpEventNormalizer());
	}

	if (options.jsonBodyParser !== false) {
		middlewareArray.push(jsonBodyParser());
	}

	if (options.validateUserInfo) {
		middlewareArray.push(validateUserInfo());
	}

	if (options.zodValidator) {
		middlewareArray.push(zodValidator(options.zodValidator));
	}

	return middlewareArray as MiddlewareObj<
		APIGatewayEvent<
			unknown,
			Record<string, unknown>,
			Record<string, unknown>,
			Record<string, unknown>,
			Record<string, unknown[]>
		>
	>[];
}
