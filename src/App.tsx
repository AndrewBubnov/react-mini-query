import { FormEvent, useState } from 'react';
import { PostType } from './types.ts';
import { useGetPost, useGetUser, useUpdatePost } from './hooks.ts';
import { queryClient } from './customQuery';

const User = () => {
	const [userId, setUserId] = useState(1);

	const { data, isLoading } = useGetUser(userId);

	if (isLoading) return <div style={{ height: 90, padding: 20 }}>Loading...</div>;

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
					onClick={() => setUserId(prevState => Math.min(prevState + 1, 3))}
					style={{
						background: 'steelblue',
						color: 'white',
					}}
				>
					Next user
				</button>
				<button
					onClick={() => setUserId(prevState => Math.max(prevState - 1, 1))}
					style={{
						background: 'steelblue',
						color: 'white',
					}}
				>
					Prev user
				</button>
			</div>
			<div style={{ padding: 20 }}>
				<div key={data?.id} style={{ display: 'flex', gap: 16 }}>
					<span>{data?.id}</span>
					<span>{data?.name}</span>
				</div>
			</div>
		</div>
	);
};

const Post = ({ postId }: { postId: number }) => {
	const { isLoading, error, data } = useGetPost(postId);
	const updateBodyMutation = useUpdatePost();

	if (isLoading) return <div style={{ height: 90, padding: 20 }}>Loading...</div>;

	if (error) return 'An error has occurred: ' + error.message;

	const updateFieldHandler = (fieldName: keyof PostType) => async (evt: FormEvent<HTMLFormElement>) => {
		evt.preventDefault();
		const formData = new FormData(evt.currentTarget);
		const fieldValue = formData.get(fieldName) as keyof PostType;
		evt.currentTarget.reset();
		updateBodyMutation.mutate({ ...data, [fieldName]: fieldValue } as PostType, {
			onSuccess: (data, { id }) => queryClient.invalidateQueries({ queryKey: ['postData', id] }, data),
		});
	};

	return (
		<div style={{ padding: 20 }}>
			{isLoading && <p>Re-fetching...</p>}
			<div key={data?.id} style={{ display: 'flex', flexDirection: 'column' }}>
				<h4>{data?.title}</h4>
				<span>{data?.body}</span>
			</div>
			<div style={{ display: 'flex', gap: 16 }}>
				<form onSubmit={updateFieldHandler('title')} style={{ width: '100%' }}>
					<input
						type="text"
						name="title"
						placeholder="Update title..."
						style={{ width: '100%', height: 20 }}
					/>
				</form>
				<form onSubmit={updateFieldHandler('body')} style={{ width: '100%' }}>
					<input type="text" name="body" placeholder="Update body..." style={{ width: '100%', height: 20 }} />
				</form>
			</div>
		</div>
	);
};

function App() {
	const [postId, setPostId] = useState(1);

	return (
		<div>
			<User />
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
			<div>
				<Post postId={postId} />
				<Post postId={postId} />
				<Post postId={postId} />
			</div>
		</div>
	);
}

export default App;
