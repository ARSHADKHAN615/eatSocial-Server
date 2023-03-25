import PostModel from "../Models/Post.js";

const LikeController = {
    createLike: async (req, res, next) => {
        const { postId } = req.params;
        try {
            const row = await PostModel.createLike(req, postId);
            res.status(201).json({ message: 'Like created' });
        } catch (err) {
            return next(err);
        }

    },
    deleteLike: async (req, res, next) => {
        const { postId } = req.params;

        try {
            const row = await PostModel.deleteLike(req, postId);
            res.status(200).json({ message: 'Removed like' });
        } catch (err) {
            return next(err);
        }
    },
};

export default LikeController;