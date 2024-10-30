import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClient, QueryProvider } from './react-mini-query';

const queryClient = new QueryClient({ gcTime: 60 * 1000 });

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryProvider client={queryClient}>
			<App />
		</QueryProvider>
	</StrictMode>
);
