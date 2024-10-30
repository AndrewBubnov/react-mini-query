import { QueryClient } from './QueryClient.ts';
import { QueryState, Subscriber, UseQuery } from './types.ts';
import { useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from './useQueryClient.ts';

const createQueryObserver = <T>(
	queryClient: QueryClient<T>,
	{ queryKey, queryFn, keepPreviousData, enabled = true }: UseQuery
): Subscriber<T> => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
		keepPreviousData,
	});

	return {
		subscribe: (callback: () => void) => {
			query.listeners.add(callback);
			if (enabled && !query.state.data && !query.state.isLoading) query.fetch();
			return () => query.listeners.delete(callback);
		},
		getSnapshot: () => query.state,
	};
};

export const useQuery = <T>({ queryKey, queryFn, enabled, keepPreviousData }: UseQuery): QueryState<T> => {
	const queryClient = useQueryClient();
	const { subscribe, getSnapshot } = useMemo(
		() => createQueryObserver<T>(queryClient as QueryClient<T>, { queryKey, queryFn, enabled, keepPreviousData }),
		[queryClient, queryKey, queryFn, enabled, keepPreviousData]
	);

	return useSyncExternalStore(subscribe, getSnapshot);
};
