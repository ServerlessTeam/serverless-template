export interface ErrorResponse {
	error: {
		type: string;
		message?: string;
		payload?: unknown;
	};
}

export function isErrorResponse(
	response: APIGatewayResponseExtended<unknown>,
): response is APIGatewayResponseExtended<ErrorResponse> {
	return (
		!!response.body &&
		typeof response.body === 'object' &&
		Object.prototype.hasOwnProperty.call(response.body, 'error')
	);
}

export class APIGatewayResponseExtended<TBody> {
	statusCode: number;
	body: TBody;
	headers: Record<string, string>;
	isBase64Encoded: boolean;

	constructor({
		statusCode = 200,
		body,
		headers = {},
		isBase64Encoded = false,
		contentType,
	}: {
		body: APIGatewayResponseExtended<TBody>['body'];
		statusCode?: APIGatewayResponseExtended<TBody>['statusCode'];
		headers?: APIGatewayResponseExtended<TBody>['headers'];
		isBase64Encoded?: APIGatewayResponseExtended<TBody>['isBase64Encoded'];
		contentType?: string;
	}) {
		this.statusCode = statusCode;
		this.body = body;
		this.headers = { ...headers };
		if (contentType) {
			this.headers['Content-Type'] = contentType;
		} else {
			const hasContentType = Object.keys(headers).some((header) => {
				return header.toLowerCase() === 'content-type';
			});
			if (!hasContentType) {
				this.headers['Content-Type'] = 'application/json';
			}
		}

		this.isBase64Encoded = isBase64Encoded;
	}
}

export type APIGatewayResponse<T> =
	| T
	| APIGatewayResponseExtended<T | ErrorResponse>;
