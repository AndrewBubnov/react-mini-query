import { useEffect, useState } from 'react';

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
	post: () => void;
	subscribe: (rerender: () => void) => void;
	getQueryState: () => QueryState<T>;
};

type Query<T> = {
	queryKey: (string | number)[];
	queryHash: string;
	fetchingFunction: (() => Promise<void>) | null;
	subscribers: Subscriber<T>[];
	state: QueryState<T>;
	subscribe: (subscriber: Subscriber<T>) => () => void;
	setState: (updater: (arg: QueryState<T>) => QueryState<T>) => void;
	fetch: () => Promise<void>;
};

const createQuery = <T>({ queryKey, queryFn }: UseQueryParams): Query<T> => {
	const query: Query<T> = {
		queryKey,
		queryHash: JSON.stringify(queryKey),
		fetchingFunction: null,
		subscribers: [],
		state: {
			status: 'pending',
			isFetching: true,
			data: undefined,
			error: undefined,
			lastUpdated: 0,
		},

		subscribe: newSubscriber => {
			query.subscribers.push(newSubscriber);
			return () => {
				query.subscribers = query.subscribers.filter(subscriber => subscriber !== newSubscriber);
			};
		},

		setState: (updater: (arg: QueryState<T>) => QueryState<T>) => {
			query.state = updater(query.state);
			query.subscribers.forEach(s => s.post());
		},

		fetch: async () => {
			if (!query.fetchingFunction) {
				query.fetchingFunction = async () => {
					if (query.state?.data) return;
					query.setState((state: QueryState<T>) => {
						return {
							...state,
							isFetching: true,
							error: undefined,
						};
					});

					try {
						const data = (await queryFn()) as T;
						query.setState((state: QueryState<T>) => {
							return {
								...state,
								status: 'success',
								data,
								lastUpdated: Date.now(),
							};
						});
					} catch (error) {
						query.setState((state: QueryState<T>) => {
							return {
								...state,
								status: 'error',
								error: error as Error,
							};
						});
					} finally {
						query.setState((state: QueryState<T>) => {
							return { ...state, isFetching: false };
						});
					}
				};
			}
			await query.fetchingFunction();
		},
	};

	return query;
};

export class QueryClient<T> {
	queries: Set<Query<T>>;

	constructor() {
		this.queries = new Set<Query<T>>();
	}

	getQuery = ({ queryFn, queryKey }: UseQueryParams) => {
		const queryHash = JSON.stringify(queryKey);

		const query = [...this.queries].find(query => query.queryHash === queryHash);
		if (query) return query;

		const newQuery = createQuery<T>({ queryKey, queryFn });
		this.queries.add(newQuery);
		return newQuery;
	};

	// getState = () => this.queries;

	// subscribe = (callback) => {
	// 		subscribers.add(callback);
	// 		return () => subscribers.delete(callback);
	// 	}
}

const createQueryObserver = <T>(queryClient: QueryClient<T>, { queryKey, queryFn }: UseQueryParams) => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
	});

	const observer: Subscriber<T> = {
		post: () => {},
		subscribe: rerender => {
			const unsubscribe = query.subscribe(observer);
			observer.post = rerender;
			if (!query.state.lastUpdated || Date.now() - query.state.lastUpdated > 0) {
				query.fetch();
			}
			return unsubscribe;
		},
		getQueryState: () => query.state,
	};

	return observer;
};

export const useQuery = <T>({ queryKey, queryFn }: UseQueryParams): QueryState<T> => {
	const [, setCount] = useState(0);

	const observer = createQueryObserver<T>(queryClient as QueryClient<T>, {
		queryKey,
		queryFn,
	});

	const queryHash = JSON.stringify(queryKey);

	useEffect(() => observer.subscribe(() => setCount(c => c + 1)), [queryHash]);

	return observer.getQueryState();
};

export const queryClient = new QueryClient();
