import { QueryKey } from './types.ts';
import { isEqual } from './utils.ts';

class PreviousDataStore {
	previousQueryKeysSet: QueryKey[];

	constructor() {
		this.previousQueryKeysSet = [];
	}

	getPreviousQueryKeyHash = (queryKey: QueryKey) => {
		const previousQueryKey = [...this.previousQueryKeysSet].reverse().find(queryKey => {
			const basePrevKey = queryKey.slice(0, -1);
			return isEqual(basePrevKey, queryKey.slice(0, -1));
		});

		if (!this.previousQueryKeysSet.some(key => isEqual(key, queryKey))) this.previousQueryKeysSet.push(queryKey);

		console.log({ previousQueryKeysSet: this.previousQueryKeysSet, queryKey, previousQueryKey });

		return previousQueryKey ? JSON.stringify(previousQueryKey) : '';
	};
}

export const previousDataStore = new PreviousDataStore();
export const { getPreviousQueryKeyHash } = previousDataStore;
