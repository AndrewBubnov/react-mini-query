import { QueryKey } from './types.ts';

export const isEqual = (queryKey1: QueryKey, queryKey2: QueryKey) => {
	return (
		Array.isArray(queryKey1) &&
		Array.isArray(queryKey2) &&
		queryKey2.every((key, index) => String(queryKey1[index]) === String(key))
	);
};
