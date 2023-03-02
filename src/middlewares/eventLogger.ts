import { MiddlewareObj } from '@middy/core';
import isObject from 'lodash.isobject';

function maskSensitiveFields<T>(event: T): T {
	if (!isObject(event)) {
		return event;
	}

	const propertiesToMask = new Set([
		'email',
		'password',
		'phoneNumber',
		'login',
		'rawBody',
		'macAddress',
		'authorization',
	]);

	const objectsToMask = new Set(['authorizer']);

	return Object.entries(event).reduce((result, [key, value]) => {
		if (propertiesToMask.has(key) && typeof value === 'string') {
			return {
				...result,
				[key]: 'HIDDEN',
			};
		}

		if (isObject(value)) {
			if (objectsToMask.has(key)) {
				return {
					...result,
					[key]: 'HIDDEN',
				};
			}

			return {
				...result,
				[key]: maskSensitiveFields(value),
			};
		}

		return result;
	}, event);
}

export default function eventLogger({
	logPrefix = 'Event: ',
}: {
	logPrefix?: string;
} = {}): MiddlewareObj {
	return {
		before: (req) => {
			console.log(logPrefix, JSON.stringify(maskSensitiveFields(req.event), undefined, 4));
		},
	};
}
