export type EnvVarName =
	| 'STAGE'
	| 'REGION'
	| 'ACCOUNT_ID'
	| 'USER_API_BASE_URL';

export function getEnvVar(name: EnvVarName, defaultValue?: string): string {
	const res = process.env[name] ?? defaultValue;
	if (typeof res === 'undefined') {
		throw new TypeError(`Environment variable '${name}' is not defined`);
	}

	return res;
}
