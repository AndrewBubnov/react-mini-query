import { FormEvent, useState } from 'react';
import { queryClient, useQuery } from './customQuery';
import { useMutation } from './customQuery/useMutation.ts';

type PostType = {
	id: number;
	userId: number;
	title: string;
	body: string;
};

const fetchPost = async (postId: number) => {
	const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
	return res.json();
};

const updatePostBody = async (data: PostType) => {
	const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${data.id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: { 'Content-type': 'application/json; charset=UTF-8' },
	});
	return res.json();
};

const useUpdatePostBody = () =>
	useMutation(
		{
			mutationFn: updatePostBody,
		},
		{
			onSuccess: (data, { id }) => queryClient.invalidateQueries({ queryKey: ['postData', id] }, data),
		}
	);

const useGetPost = (postId: number) =>
	useQuery<PostType>({
		queryKey: ['postData', postId],
		queryFn: fetchPost.bind(null, postId),
	});

const Post = ({ postId }: { postId: number }) => {
	const { status, isLoading, error, data } = useGetPost(postId);
	const updateBodyMutation = useUpdatePostBody();

	if (status === 'pending') return 'Loading...';

	if (error) return 'An error has occurred: ' + error.message;

	const bodyUpdateSubmitHandler = (evt: FormEvent<HTMLFormElement>) => {
		evt.preventDefault();
		const formData = new FormData(evt.currentTarget);
		const body = (formData.get('body') as string) || '';
		updateBodyMutation.mutate({
			id: data?.id || 0,
			userId: data?.userId || 0,
			title: data?.title || '',
			body,
		});
		evt.currentTarget.reset();
	};

	return (
		<div style={{ padding: 20 }}>
			{isLoading && <p>Re-fetching...</p>}
			<div key={data?.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<span>{data?.title}</span>
				<span>{data?.body}</span>
			</div>
			<form onSubmit={bodyUpdateSubmitHandler}>
				<input type="text" name="body" placeholder="Change body" style={{ width: '60%', height: 20 }} />
			</form>
		</div>
	);
};

function App() {
	const [postId, setPostId] = useState(1);

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					width: 300,
					padding: 20,
					alignItems: 'baseline',
				}}
			>
				<button
					onClick={() => setPostId(prevState => prevState + 1)}
					style={{
						background: 'steelblue',
						color: 'white',
					}}
				>
					Next post
				</button>
				<button
					onClick={() => setPostId(prevState => Math.max(prevState - 1, 1))}
					style={{
						background: 'steelblue',
						color: 'white',
					}}
				>
					Prev post
				</button>
				<h3>{postId}</h3>
			</div>
			<Post postId={postId} />
			<Post postId={postId} />
			<Post postId={postId} />
		</div>
	);
}

export default App;
