import { QueryKey } from './types.ts';
import { isEqual } from './utils.ts';

class PreviousDataStore {
	previousQueryKeysSet: QueryKey[];

	constructor() {
		this.previousQueryKeysSet = [];
	}

	getPreviousQueryKeyHash = (queryKey: QueryKey) => {
		const previousQueryKey = [...this.previousQueryKeysSet]
			.reverse()
			.find(prevKey => isEqual(prevKey.slice(0, prevKey.length - 1), queryKey.slice(0, queryKey.length - 1)));
		if (!this.previousQueryKeysSet.find(prevKey => isEqual(prevKey, queryKey))) {
			this.previousQueryKeysSet.push(queryKey);
		}
		return JSON.stringify(previousQueryKey);
	};
}

export const previousDataStore = new PreviousDataStore();
export const { getPreviousQueryKeyHash } = previousDataStore;
