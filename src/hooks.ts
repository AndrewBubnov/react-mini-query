import { fetchPost, fetchUser, updatePost } from './api.ts';
import { useMutation, useQuery, useQueryClient } from './react-mini-query';
import { PostType, UserType } from './types.ts';

export const useUpdatePost = () => {
	const queryClient = useQueryClient();
	return useMutation(updatePost, {
		onSuccess: (data, { id }) => queryClient.invalidateQueries({ queryKey: ['postData', id] }, data),
	});
};

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
		refetchOnWindowFocus: false,
	});
