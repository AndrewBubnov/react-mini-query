import { QueryKey } from './types.ts';

type PreviousData = {
	keepPreviousData?: boolean;
	queryKey: QueryKey;
};

class PreviousDataStore<T> {
	previousData: Map<string, T>;

	constructor() {
		this.previousData = new Map<string, T>();
	}

	getQueryKeyHash = ({ keepPreviousData, queryKey }: PreviousData) =>
		keepPreviousData ? JSON.stringify(queryKey.slice(0, queryKey.length - 1)) : undefined;

	getPreviousData = ({ keepPreviousData, queryKey }: PreviousData) => {
		const previousDataQueryKeyHash = this.getQueryKeyHash({ keepPreviousData, queryKey });
		return keepPreviousData ? this.previousData.get(previousDataQueryKeyHash!) : undefined;
	};

	savePreviousData = ({ keepPreviousData, queryKey }: PreviousData) => {
		const previousDataQueryKeyHash = this.getQueryKeyHash({ keepPreviousData, queryKey });
		return keepPreviousData
			? (previousData: T) => {
					this.previousData.set(previousDataQueryKeyHash!, previousData);
				}
			: undefined;
	};
}

export const { getPreviousData, savePreviousData } = new PreviousDataStore();
