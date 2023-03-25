import PostModel from "../Models/Post.js";

const CommentController = {
    getComments: async (req, res, next) => {
        const { postId } = req.params;
        try {
            const row = await PostModel.getComments(req, postId);
            res.status(200).json(row);
        } catch (err) {
            return next(err);
        }
    },
    createComment: async (req, res, next) => {
        const { postId } = req.params;
        try {
            const row = await PostModel.createComment(req, postId);
            res.status(201).json({ message: 'Comment created' });
        } catch (err) {
            return next(err);
        }
    },
};

export default CommentController;