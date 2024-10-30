import { beforeEach, describe, expect, it } from 'vitest';
import { getPreviousQueryKeyHash, previousDataStore } from '../PreviousDataStore.ts';

describe('PreviousDataStore', () => {
	beforeEach(() => {
		previousDataStore.previousQueryKeysSet = [];
	});

	it('should correctly identify previous query keys', () => {
		const hash1 = getPreviousQueryKeyHash(['test', 1]);
		expect(hash1).toBe(undefined);
		expect(previousDataStore.previousQueryKeysSet).toEqual([['test', 1]]);

		const hash2 = getPreviousQueryKeyHash(['test', 2]);
		expect(JSON.parse(hash2!)).toEqual(['test', 1]);
		expect(previousDataStore.previousQueryKeysSet).toEqual([
			['test', 1],
			['test', 2],
		]);

		const hash3 = getPreviousQueryKeyHash(['test', 3]);
		expect(JSON.parse(hash3!)).toEqual(['test', 2]);
	});

	it('should handle different base keys', () => {
		getPreviousQueryKeyHash(['posts', 1]);
		getPreviousQueryKeyHash(['users', 1]);
		const hash = getPreviousQueryKeyHash(['posts', 2]);
		expect(hash).toBe('["posts",1]');
	});
});
