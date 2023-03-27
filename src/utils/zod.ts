import { z } from 'zod';

export function isSchema<TSchema extends z.ZodFirstPartySchemaTypes>(
	schema: z.ZodFirstPartySchemaTypes,
	typeName: TSchema['_def']['typeName'],
): schema is TSchema {
	return schema._def.typeName === typeName;
}

export function zodToNumber(v: unknown): unknown {
	return v && Number(v);
}
