import Boom from '@hapi/boom';
import { MiddlewareObj } from '@middy/core';
import { HttpError } from '@middy/util';

import { APIGatewayResponseExtended, ErrorResponse } from '@/utils/aws';

const isHttpError = (error: Error): error is HttpError =>
	'status' in error && 'statusCode' in error;

// Transforms response to http standards.
export default function apiGatewayResponse(): MiddlewareObj {
	return {
		after: (req) => {
			if (!(req.response instanceof APIGatewayResponseExtended)) {
				req.response = new APIGatewayResponseExtended({
					body: req.response,
				});
			}
		},
		onError: (req) => {
			if (!req.error) return;

			console.error(req.error);

			let error: Boom.Boom;
			if (Boom.isBoom(req.error)) {
				error = req.error;
			} else if (isHttpError(req.error)) {
				error = Boom.boomify(req.error, {
					statusCode: req.error.statusCode,
				});
			} else {
				error = Boom.boomify(req.error);
				error.name ??= 'InternalError';
			}

			req.response = new APIGatewayResponseExtended<ErrorResponse>({
				statusCode: error.output.statusCode,
				body: {
					error: {
						type: error.output.payload.error,
						message:
							error.output.statusCode === 500
								? undefined
								: error.message,
						payload: error.data ?? undefined,
					},
				},
			});

			req.error = null;
		},
	};
}
