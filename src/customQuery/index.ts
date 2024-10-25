import { useEffect, useState } from 'react';

type UseQueryParams = {
	queryKey: (string | number)[];
	queryFn: (...args: unknown[]) => Promise<unknown>;
};
type Subscriber = {
	post: () => void;
	subscribe: (rerender: () => void) => void;
	getQueryState: () => Query['state'];
};
type Query = {
	queryKey: (string | number)[];
	queryHash: string;
	fetchingFunction: (() => Promise<void>) | null;
	subscribers: Subscriber[];
	state: {
		status: string;
		isFetching: boolean;
		data: unknown;
		error?: Error;
		lastUpdated: number;
	};
	subscribe: (subscriber: Subscriber) => () => void;
	setState: (updater: (arg: Query['state']) => Query['state']) => void;
	fetch: () => Promise<void>;
};

const createQuery = ({ queryKey, queryFn }: UseQueryParams) => {
	const query: Query = {
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

		setState: (updater: (arg: Query['state']) => Query['state']) => {
			query.state = updater(query.state);
			query.subscribers.forEach(s => s.post());
		},

		fetch: async () => {
			if (!query.fetchingFunction) {
				query.fetchingFunction = async () => {
					if (query.state?.data) return;
					query.setState((oldState: Query['state']) => {
						return {
							...oldState,
							isFetching: true,
							error: undefined,
						};
					});

					try {
						const data = await queryFn();
						query.setState((oldState: Query['state']) => {
							return {
								...oldState,
								status: 'success',
								data,
								lastUpdated: Date.now(),
							};
						});
					} catch (error) {
						query.setState((oldState: Query['state']) => {
							return {
								...oldState,
								status: 'error',
								error: error as Error,
							};
						});
					} finally {
						query.setState((oldState: Query['state']) => {
							return {
								...oldState,
								isFetching: false,
							};
						});
					}
				};
			}
			await query.fetchingFunction();
		},
	};

	return query;
};

export class QueryClient {
	queries: Set<Query>;

	constructor() {
		this.queries = new Set<Query>();
	}

	getQuery = ({ queryFn, queryKey }: UseQueryParams) => {
		const queryHash = JSON.stringify(queryKey);

		const query = [...this.queries].find(query => query.queryHash === queryHash);
		if (query) return query;

		const newQuery = createQuery({ queryKey, queryFn });
		this.queries.add(newQuery);
		return newQuery;
	};

	// getState = () => this.queries;

	// subscribe = (callback) => {
	// 		subscribers.add(callback);
	// 		return () => subscribers.delete(callback);
	// 	}
}

const createQueryObserver = (queryClient: QueryClient, { queryKey, queryFn }: UseQueryParams) => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
	});

	const observer: Subscriber = {
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

export const useQuery = ({ queryKey, queryFn }: UseQueryParams) => {
	const [, setCount] = useState(0);

	const observer = createQueryObserver(queryClient, {
		queryKey,
		queryFn,
	});

	const queryHash = JSON.stringify(queryKey);

	useEffect(() => observer.subscribe(() => setCount(c => c + 1)), [queryHash]);

	return observer.getQueryState();
};

export const queryClient = new QueryClient();
