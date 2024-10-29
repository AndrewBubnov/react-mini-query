import { Query, QueryState, QueryStatus, QueryKey, GetQuery, CreateQuery } from './types.ts';
import { getPreviousData, savePreviousData } from './previousData.ts';

const areArraysEqual = (arrayA: QueryKey, arrayB: QueryKey) => {
	if (arrayA.length !== arrayB.length) return false;
	return arrayA.every((element, index) => String(element) === String(arrayB[index]));
};

const createQuery = <T>({ queryKey, queryFn, previousData, savePreviousData }: CreateQuery<T>): Query<T> => {
	const query: Query<T> = {
		queryKey,
		tempFetch: null,
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
			if (query.tempFetch) return query.tempFetch;

			query.setState(state => ({
				...state,
				...(previousData && { data: previousData }),
				isLoading: !previousData,
				error: undefined,
			}));

			query.tempFetch = (async () => {
				try {
					const data = (await queryFn()) as T;
					query.setState(state => ({
						...state,
						status: QueryStatus.Success,
						data,
						lastUpdated: Date.now(),
					}));
					if (savePreviousData) savePreviousData(data);
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
					query.tempFetch = null;
				}
			})();

			return query.tempFetch;
		},
	};

	return query;
};

export class QueryClient<T> {
	queries: Map<string, Query<T>>;

	constructor() {
		this.queries = new Map<string, Query<T>>();
	}

	getQuery = ({ queryFn, queryKey, keepPreviousData }: GetQuery) => {
		const queryHash = JSON.stringify(queryKey);

		if (!this.queries.has(queryHash)) {
			const newQuery = createQuery<T>({
				queryKey,
				queryFn,
				previousData: getPreviousData({ queryKey, keepPreviousData }) as T,
				savePreviousData: savePreviousData({ queryKey, keepPreviousData }),
			});
			this.queries.set(queryHash, newQuery);
		}

		return this.queries.get(queryHash)!;
	};

	invalidateQueries = ({ queryKey }: { queryKey: QueryKey }, data?: T) => {
		const updatedQueryKeys = [...this.queries.keys()].filter(key =>
			areArraysEqual(this.queries.get(key)?.queryKey || [], queryKey)
		);

		const updatedMap = new Map<string, Query<T>>();

		updatedQueryKeys.forEach(key => {
			const query = this.queries.get(key);
			if (!query) return;
			if (data) {
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
