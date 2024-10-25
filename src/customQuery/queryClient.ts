import { Query, QueryState, QueryStatus, UseQueryParams } from './types.ts';

const areArraysEqual = (arrayA: UseQueryParams['queryKey'], arrayB: UseQueryParams['queryKey']) => {
	if (arrayA.length !== arrayB.length) return false;
	return arrayA.every((element, index) => element === arrayB[index]);
};

const createQuery = <T>({ queryKey, queryFn }: UseQueryParams): Query<T> => {
	const query: Query<T> = {
		queryKey,
		fetchingFunction: null,
		listeners: new Set(),
		state: {
			status: QueryStatus.Pending,
			isLoading: false,
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
				isLoading: true,
				error: undefined,
			}));

			query.fetchingFunction = (async () => {
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

	invalidateQueries = ({ queryKey }: { queryKey: UseQueryParams['queryKey'] }, data?: T) => {
		const updatedQueryKeys = [...this.queries.keys()].filter(key =>
			areArraysEqual(this.queries.get(key)?.queryKey || [], queryKey)
		);
		const updatedMap = new Map<string, Query<T>>(
			updatedQueryKeys.reduce<[string, Query<T>][]>(
				(acc, cur) => {
					const updatedValue = {
						...this.queries.get(cur),
						queryKey,
						state: { ...this.queries.get(cur)?.state, data },
					} as Query<T>;
					acc.push([cur, updatedValue]);
					return acc;
				},
				[] as [string, Query<T>][]
			)
		);
		updatedQueryKeys.forEach(key => this.queries.get(key)?.notify());
		this.queries = new Map([...this.queries, ...updatedMap]);
	};
}

export const queryClient = new QueryClient();
