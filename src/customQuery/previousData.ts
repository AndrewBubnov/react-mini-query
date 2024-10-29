import { QueryKey } from './types.ts';
import { isEqual } from './utils.ts';

class PreviousDataStore {
	previousQueryKeysSet: QueryKey[];

	constructor() {
		this.previousQueryKeysSet = [];
	}

	getPreviousQueryKeyHash = (queryKey: QueryKey) => {
		const previousQueryKey = this.previousQueryKeysSet
			.reverse()
			.find(el => isEqual(el.slice(0, el.length - 1), queryKey.slice(0, queryKey.length - 1)));
		if (!this.previousQueryKeysSet.find(el => isEqual(el, queryKey))) {
			this.previousQueryKeysSet.push(queryKey);
		}
		return JSON.stringify(previousQueryKey);
	};
}

export const { getPreviousQueryKeyHash } = new PreviousDataStore();
