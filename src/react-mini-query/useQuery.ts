import { QueryClient } from './QueryClient.ts';
import { CreateQueryObserver, QueryState, Subscriber, UseQuery } from './types.ts';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from './useQueryClient.ts';

const createQueryObserver = <T>(
	queryClient: QueryClient<T>,
	{ queryKey, queryFn, keepPreviousData, enabled = true }: CreateQueryObserver
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
		fetch: query.fetch,
	};
};

export const useQuery = <T>({
	queryKey,
	queryFn,
	enabled,
	keepPreviousData,
	refetchOnWindowFocus = true,
}: UseQuery): QueryState<T> => {
	const queryClient = useQueryClient();

	const { subscribe, getSnapshot, fetch } = useMemo(
		() => createQueryObserver<T>(queryClient as QueryClient<T>, { queryKey, queryFn, enabled, keepPreviousData }),
		[queryClient, queryKey, queryFn, enabled, keepPreviousData]
	);

	useEffect(() => {
		const listener = () => {
			if (refetchOnWindowFocus && !document.hidden) fetch();
		};
		window.addEventListener('visibilitychange', listener);
		return () => window.removeEventListener('visibilitychange', listener);
	}, [fetch, refetchOnWindowFocus]);

	return useSyncExternalStore(subscribe, getSnapshot);
};
