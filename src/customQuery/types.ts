export type UseQueryParams = {
	queryKey: (string | number)[];
	queryFn: (...args: unknown[]) => Promise<unknown>;
};

export enum QueryStatus {
	Pending = 'pending',
	Success = 'success',
	Error = 'error',
}

export type QueryState<T> = {
	status: QueryStatus;
	isLoading: boolean;
	data?: T;
	error?: Error;
	lastUpdated: number;
};

export type Subscriber<T> = {
	subscribe: (callback: () => void) => () => void;
	getSnapshot: () => QueryState<T>;
};

export type Query<T> = {
	queryKey: (string | number)[];
	fetchingFunction: Promise<void> | null;
	listeners: Set<() => void>;
	state: QueryState<T>;
	notify: () => void;
	setState: (updater: (arg: QueryState<T>) => QueryState<T>) => void;
	fetch: () => Promise<void>;
};
