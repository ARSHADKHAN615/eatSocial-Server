import db from "../connect.js";

const CommentController = {
    getComments: (req, res, next) => {
        const { postId } = req.params;

        const query = 'SELECT c.*,u.name,u.profilePic FROM comments AS c LEFT JOIN users AS u ON (c.userId = u.id) WHERE c.postId = ? ORDER BY c.createdAt DESC';

        db.query(query, [postId], (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        })
    },
    createComment: (req, res, next) => {
        const { postId } = req.params;
        const { description } = req.body;

        const query = "INSERT INTO comments (`postId`, `userId`, `description`, `createdAt`) VALUES (?, ?, ?, NOW())";


        db.query(query, [postId, req.user.id, description], (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Comment created' });
        })
    },
};

export default CommentController;