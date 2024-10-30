import { useCallback, useState } from 'react';
import { MutateFunction, Options } from './types.ts';

export const useMutation = <TData, TVariables>(
	mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>,
	options: Options<TData, TVariables> = {}
) => {
	const { onSuccess, onError, onSettled } = options;
	const [state, setState] = useState<{
		isLoading: boolean;
		error: Error | undefined;
		data: TData | undefined;
	}>({
		isLoading: false,
		error: undefined,
		data: undefined,
	});

	const mutateAsync = useCallback(
		async (variables: TVariables) => {
			setState(prev => ({ ...prev, isLoading: true }));

			const controller = new AbortController();

			try {
				const data = await mutationFn(variables, controller.signal);
				if (onSuccess) await onSuccess(data, variables);

				setState({ isLoading: false, error: undefined, data });
				return data;
			} catch (error) {
				if (onError) await onError(error as Error, variables);

				setState({ isLoading: false, error: error as Error, data: undefined });
				throw error;
			} finally {
				if (onSettled) await onSettled(state.data, state.error, variables);
			}
		},
		[mutationFn, onSuccess, onError, onSettled, state.data, state.error]
	);

	const mutate: MutateFunction<TData, TVariables> = useCallback(
		(variables, mutateOptions = {}) => {
			mutateAsync(variables)
				.then(data => {
					mutateOptions?.onSuccess?.(data, variables);
					mutateOptions?.onSettled?.(data, undefined, variables);
				})
				.catch(error => mutateOptions?.onError?.(error, variables));
		},
		[mutateAsync]
	);

	return { ...state, mutate };
};
