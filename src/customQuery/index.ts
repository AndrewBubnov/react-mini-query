import { useEffect, useRef, useState } from 'react';

export type ObjectParam<S> = Partial<S>;
export type FunctionalParam<S> = (arg: S) => Partial<S>;
export type SetStateAction<S> = ObjectParam<S> | FunctionalParam<S>;
export type StoreCreatorItem<T, U> = (set: (action: SetStateAction<T>) => void) => U;
export type StoreCreator<T, U = T> = StoreCreatorItem<T, U> | [StoreCreatorItem<T, U>, string, T];
export type ComputedStoreCreator<T, S> = (arg: T) => S;
export type SubscribeCallback<T> = (arg: T) => void;
export type InferredSelector<T, S> = (state: Inferred<T>) => S;
export type Selector<T, S> = (state: T) => S;
export type Inferred<S> = S extends { getState: () => infer T } ? T : never;
export type UseStore<T extends Cache<unknown>> = {
	(): Inferred<T>;
	<S>(selector?: InferredSelector<T, S>): S;
} & T;

export type CreateSimple = {
	<T>(creator: StoreCreator<T>): UseStore<Cache<T>>;
};

export interface Cache<T> {
	getState: () => T;
	subscribe: (callback: SubscribeCallback<T>) => () => void;
}

type CreateQuery = {
	queryKey: string[];
	queryFn: (...args: unknown[]) => Promise<unknown>;
};
type Subscriber = {
	post: () => void;
	subscribe: (rerender: () => void) => void;
	getQueryState: () => Query['state'];
};
type Query = {
	queryKey: string[];
	queryHash: string;
	fetchingFunction: (() => Promise<void>) | null;
	subscribers: Subscriber[];
	state: {
		status: string;
		isFetching: boolean;
		data: unknown;
		error: unknown;
		lastUpdated: number;
	};
	subscribe: (subscriber: unknown) => () => void;
	setState: (updater: unknown) => void;
	fetch: () => Promise<void>;
};

const createQuery = ({ queryKey, queryFn }: CreateQuery) => {
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
								error,
							};
						});
					} finally {
						// query.fetchingFunction = null;
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
	queries: Query[];

	constructor() {
		this.queries = [];
	}

	getQuery = ({ queryFn, queryKey }: CreateQuery) => {
		const queryHash = JSON.stringify(queryKey);

		const query = this.queries.find(query => query.queryHash === queryHash);
		if (query) return query;

		const newQuery = createQuery({ queryKey, queryFn });
		this.queries.push(newQuery);
		return newQuery;
	};
}

const createQueryObserver = (queryClient, { queryKey, queryFn, staleTime = 0 }) => {
	const query = queryClient.getQuery({
		queryKey,
		queryFn,
	});

	const observer: Subscriber = {
		post: () => {},
		subscribe: rerender => {
			const unsubscribe = query.subscribe(observer);
			observer.post = rerender;
			if (!query.state.lastUpdated || Date.now() - query.state.lastUpdated > staleTime) {
				query.fetch();
			}
			return unsubscribe;
		},
		getQueryState: () => query.state,
	};

	return observer;
};

export const useQuery = ({ queryKey, queryFn }: CreateQuery) => {
	const observer = useRef(
		createQueryObserver(queryClient, {
			queryKey,
			queryFn,
		})
	);

	const keys = JSON.stringify(queryKey);
	useEffect(() => {
		observer.current = createQueryObserver(queryClient, {
			queryKey,
			queryFn,
		});
	}, [queryFn, queryKey]);

	const [, setCount] = useState(0);
	const rerender = () => setCount(c => c + 1);

	useEffect(() => {
		return observer.current.subscribe(rerender);
	}, [keys]);

	return observer.current.getQueryState();
};

// const createCache = <T extends Record<string, unknown>>() => {
// 	const store = {} as T;
// 	const subscribers = new Set<SubscribeCallback<T>>();
//
// 	// const setter = (setStateAction: SetStateAction<T>) => {
// 	// };
//
// 	return {
// 		getState: () => store,
// 		subscribe: (callback: SubscribeCallback<T>) => {
// 			subscribers.add(callback);
// 			return () => subscribers.delete(callback);
// 		},
// 	};
// };

export const queryClient = new QueryClient();
