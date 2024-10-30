import { describe, it, expect } from 'vitest';
import { QueryKey } from '../types.ts';
import { isEqual } from '../utils.ts';

describe('isEqual', () => {
	it('should return true if arrays are identical', () => {
		const queryKey1: QueryKey = ['post', 1];
		const queryKey2: QueryKey = ['post', 1];
		expect(isEqual(queryKey1, queryKey2)).toBe(true);
	});

	it('should return false if arrays have different lengths', () => {
		const queryKey1: QueryKey = ['post', 1];
		const queryKey2: QueryKey = ['post'];
		expect(isEqual(queryKey1, queryKey2)).toBe(false);
	});

	it('should return false if arrays have different values', () => {
		const queryKey1: QueryKey = ['post', 1];
		const queryKey2: QueryKey = ['post', 2];
		expect(isEqual(queryKey1, queryKey2)).toBe(false);
	});

	it('should return true if values are equivalent as strings', () => {
		const queryKey1: QueryKey = ['post', 1];
		const queryKey2: QueryKey = ['post', '1'];
		expect(isEqual(queryKey1, queryKey2)).toBe(true);
	});

	it('should return false if one array is empty', () => {
		const queryKey1: QueryKey = [];
		const queryKey2: QueryKey = ['post', 1];
		expect(isEqual(queryKey1, queryKey2)).toBe(false);
	});

	it('should return false if one argument is not an array', () => {
		const queryKey1 = 'post';
		const queryKey2: QueryKey = ['post', 1];
		// @ts-expect-error Testing invalid argument
		expect(isEqual(queryKey1, queryKey2)).toBe(false);
	});

	it('should return true for two empty arrays', () => {
		const queryKey1: QueryKey = [];
		const queryKey2: QueryKey = [];
		expect(isEqual(queryKey1, queryKey2)).toBe(true);
	});
});
