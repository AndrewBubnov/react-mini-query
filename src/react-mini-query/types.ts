import { ReactNode } from 'react';
import { QueryClient } from './QueryClient.ts';

export type QueryKey = (string | number)[];

export type QueryParams = {
	queryKey: QueryKey;
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
	refetch(): Promise<void>;
};

export type Subscriber<T> = {
	subscribe: (callback: () => void) => () => void;
	getSnapshot: () => QueryState<T>;
	fetch: () => Promise<void>;
};

export type Query<T> = {
	queryKey: QueryKey;
	tempFetch: Promise<void> | null;
	listeners: Set<() => void>;
	state: QueryState<T>;
	notify(): void;
	setState: (updater: (arg: QueryState<T>) => QueryState<T>) => void;
	fetch(): Promise<void>;
};

export type UseQuery = QueryParams & { enabled?: boolean; keepPreviousData?: boolean; refetchOnWindowFocus?: boolean };

export type CreateQueryObserver = Omit<UseQuery, 'refetchOnWindowFocus'>;

export type GetQuery = QueryParams & { keepPreviousData?: boolean };

export type CreateQuery<T> = QueryParams & { previousData?: T };

export type Options<TData, TVariables> = Partial<{
	onSuccess: (data: TData, variables: TVariables) => Promise<unknown> | void;
	onError: (error: Error, variables: TVariables) => Promise<unknown> | void;
	onSettled: (data: TData | undefined, error: Error | undefined, variables: TVariables) => Promise<unknown> | void;
}>;

export type MutateFunction<TData, TVariables> = (variables: TVariables, options?: Options<TData, TVariables>) => void;

export type QueryClientProps = Partial<{ gcTime: number }>;

export type QueryProviderType = {
	children: ReactNode;
	client: QueryClient<unknown>;
};
