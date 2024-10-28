import { useCallback, useState } from 'react';

type UseMutationArgs<TData, TVariables> = {
	mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>;
};

type Options<TData, TVariables> = Partial<{
	onSuccess?: (data: TData, variables: TVariables) => Promise<unknown> | void;
	onError?: (error: Error, variables: TVariables) => Promise<unknown> | void;
	onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => Promise<unknown> | void;
}>;

export const useMutation = <TData, TVariables>(
	{ mutationFn }: UseMutationArgs<TData, TVariables>,
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
		[mutationFn, onSuccess, onError, onSettled, state.data, state.error]
	);

	return { ...state, mutate };
};
