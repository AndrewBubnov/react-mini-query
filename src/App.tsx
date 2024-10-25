import { useState } from 'react';
import { useQuery } from './customQuery';

type PostType = {
	id: number;
	title: string;
	body: string;
};

const fetchData = async (postId: number) => {
	const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
	return res.json();
};

const usePostsQuery = (postId: number) => {
	return useQuery<PostType>({
		queryKey: ['postsData', postId],
		queryFn: fetchData.bind(null, postId),
	});
};

const Post = ({ postId }: { postId: number }) => {
	const { status, isFetching, error, data } = usePostsQuery(postId);

	if (status === 'pending') return 'Loading...';

	if (error) return 'An error has occurred: ' + error.message;

	return (
		<div style={{ padding: 20 }}>
			{isFetching && <p>Re-fetching...</p>}
			<div key={data?.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<span>{data?.title}</span>
				<span>{data?.body}</span>
			</div>
		</div>
	);
};

function App() {
	const [postId, setPostId] = useState(1);

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
				<button onClick={() => setPostId(prevState => prevState + 1)}>Next page</button>
				<button onClick={() => setPostId(prevState => Math.max(prevState - 1, 1))}>Prev page</button>
				<h3>{postId}</h3>
			</div>
			<Post postId={postId} />
		</div>
	);
}

export default App;
