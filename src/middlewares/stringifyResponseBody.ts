import { MiddlewareObj } from '@middy/core';

import hasProperty from '@/utils/hasProperty';

// Stringifies response body.
const handler: MiddlewareObj['after'] = (req) => {
	if (
		typeof req.response === 'object' &&
		hasProperty(req.response, 'body') &&
		typeof req.response.body !== 'string'
	) {
		req.response.body = JSON.stringify(req.response.body);
	}
};

export default function stringifyResponseBody(): MiddlewareObj {
	return {
		after: handler,
		onError: handler,
	};
}
