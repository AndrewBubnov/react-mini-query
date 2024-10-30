import { QueryClient } from '../QueryClient.ts';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryStatus } from '../types.ts';
import { previousDataStore } from '../PreviousDataStore.ts';

describe('QueryClient', () => {
	let queryClient: QueryClient<unknown>;

	beforeEach(() => {
		queryClient = new QueryClient();
		vi.useFakeTimers();
	});

	describe('getQuery', () => {
		it('should create new query if it does not exist', async () => {
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const queryKey = ['test'];

			const query = queryClient.getQuery({ queryFn, queryKey });

			expect(query.queryKey).toEqual(queryKey);
			expect(query.state.status).toBe(QueryStatus.Pending);
			expect(query.state.isLoading).toBe(false);
			expect(query.state.data).toBeUndefined();
		});

		it('should return existing query if it exists', () => {
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const queryKey = ['test'];

			const query1 = queryClient.getQuery({ queryFn, queryKey });
			const query2 = queryClient.getQuery({ queryFn, queryKey });

			expect(query1).toBe(query2);
		});

		it('should keep previous data if keepPreviousData is true', async () => {
			previousDataStore.previousQueryKeysSet = [];

			const initialData = { data: 'initial' };
			const queryFn1 = vi.fn().mockResolvedValue(initialData);
			const queryKey1 = ['test', 1];

			const query1 = queryClient.getQuery({
				queryFn: queryFn1,
				queryKey: queryKey1,
				keepPreviousData: true,
			});

			await query1.fetch();

			expect(query1.state.status).toBe(QueryStatus.Success);
			expect(query1.state.data).toEqual(initialData);

			const queryKey2 = ['test', 2];
			const updatedData = { data: 'updated' };
			const queryFn2 = vi.fn().mockResolvedValue(updatedData);

			const query2 = queryClient.getQuery({
				queryFn: queryFn2,
				queryKey: queryKey2,
				keepPreviousData: true,
			});
			query2.fetch().then(() => expect(query2.state.data).toEqual(updatedData));
			expect(query2.state.data).toEqual(initialData);
		});
	});

	describe('query.fetch', () => {
		it('should handle successful data fetching', async () => {
			const testData = { data: 'test' };
			const queryFn = vi.fn().mockResolvedValue(testData);
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			await query.fetch();

			expect(query.state.status).toBe(QueryStatus.Success);
			expect(query.state.data).toEqual(testData);
			expect(query.state.error).toBeUndefined();
			expect(query.state.isLoading).toBe(false);
		});

		it('should handle fetch errors', async () => {
			const error = new Error('Fetch failed');
			const queryFn = vi.fn().mockRejectedValue(error);
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			await query.fetch();

			expect(query.state.status).toBe(QueryStatus.Error);
			expect(query.state.error).toBe(error);
			expect(query.state.data).toBeUndefined();
			expect(query.state.isLoading).toBe(false);
		});

		it('should not start multiple fetches simultaneously', async () => {
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			const fetch1 = query.fetch();
			const fetch2 = query.fetch();

			expect(fetch1).toStrictEqual(fetch2);
			expect(queryFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('invalidateQueries', () => {
		it('should refetch matching queries', async () => {
			const queryFn1 = vi.fn().mockResolvedValue({ data: 'test1' });
			const queryFn2 = vi.fn().mockResolvedValue({ data: 'test2' });

			const query1 = queryClient.getQuery({ queryFn: queryFn1, queryKey: ['users', 1] });
			const query2 = queryClient.getQuery({ queryFn: queryFn2, queryKey: ['users', 2] });

			await query1.fetch();
			await query2.fetch();

			queryFn1.mockClear();
			queryFn2.mockClear();

			queryClient.invalidateQueries({ queryKey: ['users'] });

			expect(queryFn1).toHaveBeenCalled();
			expect(queryFn2).toHaveBeenCalled();
		});

		it('should update matching queries with provided data', async () => {
			const newData = { data: 'updated' };
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			await query.fetch();
			queryClient.invalidateQueries({ queryKey: ['test'] }, newData);

			expect(query.state.data).toEqual(newData);
			expect(query.state.status).toBe(QueryStatus.Success);
			expect(queryFn).toHaveBeenCalledTimes(1); // Should not call queryFn again
		});
	});

	describe('query notifications', () => {
		it('should notify listeners when state changes', async () => {
			const listener = vi.fn();
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			query.listeners.add(listener);
			await query.fetch();

			expect(listener).toHaveBeenCalled();
		});

		it('should handle multiple listeners', async () => {
			const listener1 = vi.fn();
			const listener2 = vi.fn();
			const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
			const query = queryClient.getQuery({ queryFn, queryKey: ['test'] });

			query.listeners.add(listener1);
			query.listeners.add(listener2);
			await query.fetch();

			expect(listener1).toHaveBeenCalled();
			expect(listener2).toHaveBeenCalled();
		});
	});
});
