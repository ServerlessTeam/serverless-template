const hasProperty = <TProp extends string>(
	o: unknown,
	p: TProp,
): o is { [K in TProp]: unknown } =>
	o !== null && o !== undefined && typeof o === 'object' && p in o;

export default hasProperty;
