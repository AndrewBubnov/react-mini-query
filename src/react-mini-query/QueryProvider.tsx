import { createContext } from 'react';
import { QueryClient } from './QueryClient.ts';
import { QueryProviderType } from './types.ts';

export const QueryContext = createContext<QueryClient<unknown>>({} as QueryClient<unknown>);

export const QueryProvider = ({ children, client }: QueryProviderType) => (
	<QueryContext.Provider value={client}>{children}</QueryContext.Provider>
);
