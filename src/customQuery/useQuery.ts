import { queryClient, QueryClient } from './queryClient.ts';
import { QueryState, Subscriber, UseQuery } from './types.ts';
import { useMemo, useSyncExternalStore } from 'react';

const createQueryObserver = <T>(
	queryClient: QueryClient<T>,
	{ queryKey, queryFn, enabled = true }: UseQuery
): Subscriber<T> => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
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

export const useQuery = <T>({ queryKey, queryFn, enabled }: UseQuery): QueryState<T> => {
	const { subscribe, getSnapshot } = useMemo(
		() => createQueryObserver<T>(queryClient as QueryClient<T>, { queryKey, queryFn, enabled }),
		[queryKey, queryFn]
	);

	return useSyncExternalStore(subscribe, getSnapshot);
};
