import { useCallback, useState } from 'react';

export const useMutation = <TData, TVariables>({
	mutationFn,
	onSuccess,
	onError,
	onSettled,
}: {
	mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>;
	onSuccess?: (data: TData, variables: TVariables) => Promise<unknown> | void;
	onError?: (error: Error, variables: TVariables) => Promise<unknown> | void;
	onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => Promise<unknown> | void;
}) => {
	const [state, setState] = useState<{
		isLoading: boolean;
		error: Error | undefined;
		data: TData | undefined;
	}>({
		isLoading: false,
		error: undefined,
		data: undefined,
	});

	const mutate = useCallback(
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
		[mutationFn, onSuccess, onError, onSettled]
	);

	return { ...state, mutate };
};
