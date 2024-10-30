import { useContext } from 'react';
import { QueryContext } from './QueryProvider.tsx';

export const useQueryClient = () => useContext(QueryContext);
