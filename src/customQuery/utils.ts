import { QueryKey } from './types.ts';

export const isEqual = (arrayA: QueryKey, arrayB: QueryKey) => {
	if (arrayA.length !== arrayB.length) return false;
	return arrayA.every((element, index) => String(element) === String(arrayB[index]));
};
