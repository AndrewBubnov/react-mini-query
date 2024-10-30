import { QueryKey } from './types.ts';

export const isEqual = (queryKey1: QueryKey, queryKey2: QueryKey) => {
	return (
		Array.isArray(queryKey1) &&
		Array.isArray(queryKey2) &&
		queryKey1.length === queryKey2.length &&
		queryKey2.every((key, index) => String(queryKey1[index]) === String(key))
	);
};
