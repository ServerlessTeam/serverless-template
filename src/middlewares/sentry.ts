import { MiddlewareObj } from '@middy/core';
import { RewriteFrames } from '@sentry/integrations';
import { AWSLambda } from '@sentry/serverless';
import { Context } from 'aws-lambda';

import { getEnvFlag, getEnvVar } from '@/utils/env';

AWSLambda.init({
	dsn: getEnvVar('SENTRY_DSN'),
	tracesSampleRate: 1,
	enabled: getEnvFlag('SENTRY_ENABLED'),
	integrations: [
		new RewriteFrames({
			root: '/var/task/',
		}),
	],
});

interface SentryContext extends Context {
	__sentry: {
		handlerResult: Promise<void>;
		handlerPromise: Promise<any>;
		handlerPromiseResolve: (value: any) => void;
		handlerPromiseReject: (error: any) => void;
	};
}

export default function sentry(): MiddlewareObj {
	const result: MiddlewareObj = {
		async before(req) {
			const context = req.context as SentryContext;
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- we need to override the type
			context.__sentry = {} as SentryContext['__sentry'];
			context.__sentry.handlerPromise = new Promise((resolve, reject) => {
				context.__sentry.handlerPromiseResolve = resolve;
				context.__sentry.handlerPromiseReject = reject;
			});
			const sentryHandler = AWSLambda.wrapHandler(
				async () => context.__sentry.handlerPromise,
			);
			const handlerResult = sentryHandler(req.event, req.context, () => {});
			context.__sentry.handlerResult =
				handlerResult instanceof Promise ? handlerResult : Promise.resolve();
		},

		async after(req) {
			const context = req.context as SentryContext;
			context.__sentry.handlerPromiseResolve(req.response);
			await AWSLambda.flush(2000);
		},

		async onError(req) {
			if (!req.error) {
				await result.after!(req);
				return;
			}

			const context = req.context as SentryContext;
			context.__sentry.handlerPromiseReject(req.error);
			await context.__sentry.handlerResult.catch(() => {});
			await AWSLambda.flush(2000);
		},
	};

	return result;
}
