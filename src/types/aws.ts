/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	APIGatewayEventRequestContext as APIGatewayEventRequestContextBase,
	Context,
	SQSMessageAttributes,
	SQSRecordAttributes,
} from 'aws-lambda';

import { APIGatewayResponse } from '@/utils/aws';

export type Headers = Record<string, string>;

export interface APIGatewayEvent<
	TBody,
	THeaders = Headers,
	TPathParams = Record<string, unknown>,
	TQSParams = Record<string, string>,
	TMVQSParams = Record<string, string[]>,
> {
	body: TBody;
	headers: THeaders;
	multiValueHeaders: Record<string, string[]>;
	httpMethod: string;
	isBase64Encoded: boolean;
	path: string;
	pathParameters: TPathParams;
	queryStringParameters: TQSParams;
	multiValueQueryStringParameters: TMVQSParams;
	stageVariables: Record<string, string> | null;
	requestContext: APIGatewayEventRequestContext;
	resource: string;
}

export type APIGatewayHandler<TEvent, TRes> = (
	event: APIGatewayEvent<
		TEvent extends { body: any } ? TEvent['body'] : null,
		TEvent extends { headers: any } ? TEvent['headers'] : Headers,
		TEvent extends { pathParameters: any }
			? TEvent['pathParameters']
			: Record<string, string>,
		TEvent extends { queryStringParameters: any }
			? TEvent['queryStringParameters']
			: Record<string, string>,
		TEvent extends { multiValueQueryStringParameters: any }
			? TEvent['multiValueQueryStringParameters']
			: Record<string, string[]>
	>,
	context: Context,
) => Promise<APIGatewayResponse<TRes>>;

interface APIGatewayEventRequestContext
	extends APIGatewayEventRequestContextBase {
	authorizer: Identity;
}
interface Identity {
	claims: Claims;
}

interface Claims extends Record<string, string | number | boolean> {
	sub: string;
}

export interface SQSEvent<TBody> {
	Records: SQSRecord<TBody>[];
}

export interface SQSRecord<TBody> {
	messageId: string;
	receiptHandle: string;
	body: TBody;
	attributes: SQSRecordAttributes;
	messageAttributes: SQSMessageAttributes;
	md5OfBody: string;
	eventSource: string;
	eventSourceARN: string;
	awsRegion: string;
}
