import { useMutation } from './customQuery/useMutation.ts';
import { fetchPost, fetchUser, updatePost } from './api.ts';
import { useQuery } from './customQuery';
import { PostType, UserType } from './types.ts';

export const useUpdatePost = () =>
	useMutation({
		mutationFn: updatePost,
	});

export const useGetPost = (postId: number) =>
	useQuery<PostType>({
		queryKey: ['postData', postId],
		queryFn: fetchPost.bind(null, postId),
		keepPreviousData: true,
	});

export const useGetUser = (userId: number) =>
	useQuery<UserType>({
		queryKey: ['userData', userId],
		queryFn: fetchUser.bind(null, userId),
		keepPreviousData: true,
	});
