import { Query, QueryState, QueryStatus, UseQueryParams } from './types.ts';

const areArraysEqual = (arrayA: UseQueryParams['queryKey'], arrayB: UseQueryParams['queryKey']) => {
	console.log({ arrayA, arrayB });
	if (arrayA.length !== arrayB.length) return false;
	return arrayA.every((element, index) => String(element) === String(arrayB[index]));
};

const createQuery = <T>({ queryKey, queryFn }: UseQueryParams): Query<T> => {
	const query: Query<T> = {
		queryKey,
		savedFetch: null,
		listeners: new Set(),
		state: {
			status: QueryStatus.Pending,
			isLoading: false,
			data: undefined,
			error: undefined,
			lastUpdated: 0,
			refetch: async () => {},
		},

		notify: () => {
			query.listeners.forEach(listener => listener());
		},

		setState: (updater: (arg: QueryState<T>) => QueryState<T>) => {
			query.state = updater(query.state);
			query.notify();
		},

		fetch: async () => {
			if (query.savedFetch) return query.savedFetch;

			query.setState(state => ({
				...state,
				isLoading: true,
				error: undefined,
			}));

			query.savedFetch = (async () => {
				try {
					const data = (await queryFn()) as T;
					query.setState(state => ({
						...state,
						status: QueryStatus.Success,
						data,
						lastUpdated: Date.now(),
					}));
				} catch (error) {
					query.setState(state => ({
						...state,
						status: QueryStatus.Error,
						error: error as Error,
					}));
				} finally {
					query.setState(state => ({
						...state,
						isLoading: false,
						refetch: query.fetch,
					}));
					query.savedFetch = null;
				}
			})();

			return query.savedFetch;
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

	invalidateQueries = ({ queryKey }: { queryKey: UseQueryParams['queryKey'] }, data?: T) => {
		const updatedQueryKeys = [...this.queries.keys()].filter(key =>
			areArraysEqual(this.queries.get(key)?.queryKey || [], queryKey)
		);

		const updatedMap = new Map<string, Query<T>>();

		updatedQueryKeys.forEach(key => {
			const query = this.queries.get(key);
			console.log({ query });
			if (!query) return;
			if (data) {
				console.log(data);
				query.setState(state => ({
					...state,
					status: QueryStatus.Success,
					data,
					lastUpdated: Date.now(),
					error: undefined,
				}));
			} else {
				query.fetch();
			}
			updatedMap.set(key, query);
		});
		this.queries = new Map([...this.queries, ...updatedMap]);
	};
}

export const queryClient = new QueryClient();
