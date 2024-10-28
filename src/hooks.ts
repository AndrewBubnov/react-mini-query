import { useMutation } from './customQuery/useMutation.ts';
import { fetchPost, updatePost } from './api.ts';
import { useQuery } from './customQuery';
import { PostType } from './types.ts';

export const useUpdatePost = () =>
	useMutation({
		mutationFn: updatePost,
	});

export const useGetPost = (postId: number) =>
	useQuery<PostType>({
		queryKey: ['postData', postId],
		queryFn: fetchPost.bind(null, postId),
	});
