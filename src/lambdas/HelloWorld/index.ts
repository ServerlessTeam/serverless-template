import { Handler, Context, ProxyCallback, ProxyResult } from 'aws-lambda';

import { getExampleUserById } from './utils';

const handler: Handler = async (
	event: any,
	context: Context,
	callback: ProxyCallback,
) => {
	const user = await getExampleUserById(1);
	const response: ProxyResult = {
		statusCode: 200,
		body: JSON.stringify({
			message: `Hello, ${user.first_name} ${user.last_name}`.trim(),
		}),
	};

	callback(undefined, response);
};

export { handler };
