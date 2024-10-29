import { PostType } from './types.ts';

const BASE_POST_URL = 'http://localhost:3000';

export const fetchPost = async (postId: number) => {
	const res = await fetch(`${BASE_POST_URL}/posts/${postId}`);
	return res.json();
};

export const updatePost = async (data: PostType) => {
	const res = await fetch(`${BASE_POST_URL}/posts/${data.id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: { 'Content-type': 'application/json; charset=UTF-8' },
	});
	return res.json();
};

export const fetchUser = async (userId: number) => {
	const res = await fetch(`${BASE_POST_URL}/users/${userId}`);
	return res.json();
};
