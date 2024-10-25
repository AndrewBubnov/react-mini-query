import { useState } from 'react';
import { useQuery } from './customQuery';

const fetchData = async (page: number) => {
	const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${page}`);
	return res.json();
};

const usePostsQuery = (page: number) => {
	return useQuery({
		queryKey: ['postsData', page],
		queryFn: () => fetchData(page),
	});
};

const Posts = ({ page }: { page: number }) => {
	const { status, isFetching, error, data } = usePostsQuery(page);

	if (status === 'pending') return 'Loading...';

	if (error) return 'An error has occurred: ' + error.message;

	return (
		<div style={{ padding: 20 }}>
			{isFetching && <p>Refetching...</p>}
			<div key={data.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<span>{data.title}</span>
				<span>{data.body}</span>
			</div>
		</div>
	);
};

function App() {
	const [page, setPage] = useState(1);

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
				<button onClick={() => setPage(prevState => prevState + 1)}>Next page</button>
				<button onClick={() => setPage(prevState => prevState - 1)}>Prev page</button>
			</div>
			<Posts page={page} />
		</div>
	);
}

export default App;
