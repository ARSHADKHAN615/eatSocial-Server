import PostModel from '../Models/Post.js';
import createError from '../middlewares/errorHandling.js';

const PostController = {
    getPosts: async (req, res, next) => {

        const userId = req.query.userId == 'undefined' ? null : req.query.userId;

        try {
            const row = await PostModel.getPosts(req, userId);
            if (!row.length) {
                return next(createError(404, 'No posts found'));
            }

            const posts = await Promise.all(row.map(async post => {
                const likes = (await PostModel.getLikes(req, post.id)).map((like) => like.userId);
                return {
                    ...post,
                    likes
                }
            }))

            res.status(200).json(posts);
        } catch (err) {
            return next(err);
        }

    },
    createPost: async (req, res, next) => {
        try {
            const row = await PostModel.createPost(req);
            res.status(201).json({ message: 'Post created' });
        } catch (err) {
            return next(err);
        }

    },
    updatePost: async (req, res, next) => {
        try {
            const row = await PostModel.updatePost(req);
            res.status(200).json({ message: 'Post updated' });
        } catch (err) {
            return next(err);
        }
    },
    deletePost: async (req, res, next) => {
        try {
            const row = await PostModel.deletePost(req);
            res.status(200).json({ message: 'Post deleted' });
        } catch (err) {
            return next(err);
        }
    },
}

export default PostController;