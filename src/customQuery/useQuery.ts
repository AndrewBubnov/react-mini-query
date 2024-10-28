import { queryClient, QueryClient } from './queryClient.ts';
import { QueryState, Subscriber, UseQueryParams } from './types.ts';
import { useMemo, useSyncExternalStore } from 'react';

const createQueryObserver = <T>(queryClient: QueryClient<T>, { queryKey, queryFn }: UseQueryParams): Subscriber<T> => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
	});

	return {
		subscribe: (callback: () => void) => {
			query.listeners.add(callback);
			if (!query.state.data && !query.state.isLoading) query.fetch();
			return () => query.listeners.delete(callback);
		},
		getSnapshot: () => query.state,
	};
};

export const useQuery = <T>({ queryKey, queryFn }: UseQueryParams): QueryState<T> => {
	const { subscribe, getSnapshot } = useMemo(
		() => createQueryObserver<T>(queryClient as QueryClient<T>, { queryKey, queryFn }),
		[queryKey, queryFn]
	);

	return useSyncExternalStore(subscribe, getSnapshot);
};
