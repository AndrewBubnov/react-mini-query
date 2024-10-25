import { useSyncExternalStore, useMemo } from 'react';

type UseQueryParams = {
	queryKey: (string | number)[];
	queryFn: (...args: unknown[]) => Promise<unknown>;
};

type QueryState<T> = {
	status: string;
	isFetching: boolean;
	data?: T;
	error?: Error;
	lastUpdated: number;
};

type Subscriber<T> = {
	subscribe: (callback: () => void) => () => void;
	getSnapshot: () => QueryState<T>;
};

type Query<T> = {
	queryKey: (string | number)[];
	queryHash: string;
	fetchingFunction: Promise<void> | null;
	listeners: Set<() => void>;
	state: QueryState<T>;
	notify: () => void;
	setState: (updater: (arg: QueryState<T>) => QueryState<T>) => void;
	fetch: () => Promise<void>;
};

const createQuery = <T>({ queryKey, queryFn }: UseQueryParams): Query<T> => {
	const query: Query<T> = {
		queryKey,
		queryHash: JSON.stringify(queryKey),
		fetchingFunction: null,
		listeners: new Set(),
		state: {
			status: 'pending',
			isFetching: false,
			data: undefined,
			error: undefined,
			lastUpdated: 0,
		},

		notify: () => {
			query.listeners.forEach(listener => listener());
		},

		setState: (updater: (arg: QueryState<T>) => QueryState<T>) => {
			query.state = updater(query.state);
			query.notify();
		},

		fetch: async () => {
			if (query.fetchingFunction) return query.fetchingFunction;

			query.setState(state => ({
				...state,
				isFetching: true,
				error: undefined,
			}));

			query.fetchingFunction = (async () => {
				try {
					const data = (await queryFn()) as T;
					query.setState(state => ({
						...state,
						status: 'success',
						data,
						lastUpdated: Date.now(),
					}));
				} catch (error) {
					query.setState(state => ({
						...state,
						status: 'error',
						error: error as Error,
					}));
				} finally {
					query.setState(state => ({
						...state,
						isFetching: false,
					}));
					query.fetchingFunction = null;
				}
			})();

			return query.fetchingFunction;
		},
	};

	return query;
};

export class QueryClient<T> {
	queries: Map<string, Query<T>>;

	constructor() {
		this.queries = new Map<string, Query<T>>();
	}

	getQuery = ({ queryFn, queryKey }: UseQueryParams) => {
		const queryHash = JSON.stringify(queryKey);

		if (!this.queries.has(queryHash)) {
			const newQuery = createQuery<T>({ queryKey, queryFn });
			this.queries.set(queryHash, newQuery);
		}

		return this.queries.get(queryHash)!;
	};
}

const createQueryObserver = <T>(queryClient: QueryClient<T>, { queryKey, queryFn }: UseQueryParams): Subscriber<T> => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
	});

	return {
		subscribe: (callback: () => void) => {
			query.listeners.add(callback);
			if (!query.state.data && !query.state.isFetching) query.fetch();
			return () => query.listeners.delete(callback);
		},
		getSnapshot: () => query.state,
	};
};

export const useQuery = <T>({ queryKey, queryFn }: UseQueryParams): QueryState<T> => {
	const observer = useMemo(
		() => createQueryObserver<T>(queryClient as QueryClient<T>, { queryKey, queryFn }),
		[JSON.stringify(queryKey)]
	);

	return useSyncExternalStore(observer.subscribe, observer.getSnapshot);
};

export const queryClient = new QueryClient();
