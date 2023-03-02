/** Returns false if the given value is an undefined or null value */
export const isValid = <T>(value: T | undefined | null): value is T =>
	value !== undefined && value !== null;

/** Returns true and tells the TypesCript compiler that the given value is a valid string when this is the case */
export const isValidString = (str: any): str is string =>
	isValid(str) && typeof str === 'string' && str.length > 0;

/** Returns true and tells the TypesCript compiler that the given value is a valid number when this is the case */
export const isValidNumber = (num: any): num is number =>
	// eslint-disable-next-line no-restricted-globals
	isValid(num) && !isNaN(Number(num)) && typeof num !== 'boolean';

/** Returns true and tells the TypesCript compiler that the given value is a valid number when this is the case */
export const isValidUnsignedInteger = (num: any): num is number =>
	isValidNumber(num) && Number.isInteger(Number(num)) && num >= 0;

/** Returns true and tells the TypesCript compiler that the given value is a valid number when this is the case */
export const isValidArray = <T>(arr: any): arr is T[] =>
	isValid(arr) && Array.isArray(arr);
