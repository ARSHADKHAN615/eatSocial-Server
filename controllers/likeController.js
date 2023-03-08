import db from "../connect.js";

const LikeController = {
    getLikes: (req, res, next) => {
        const { postId } = req.params;

        const query = 'SELECT userId FROM likes AS l WHERE l.postId = ?';

        db.query(query, [postId], (err, data) => {
            if (err) return next(err);
            res.status(200).json(data.map((like) => like.userId));
        })
    },
    createLike: (req, res, next) => {
        const { postId } = req.params;

        const query = 'INSERT INTO likes (`postId`, `userId`) VALUES (?,?)';

        db.query(query, [postId, req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Like created' });
        })

    },
    deleteLike: (req, res, next) => {
        const { postId } = req.params;

        const query = 'DELETE FROM likes WHERE postId = ? AND userId = ?';

        db.query(query, [postId, req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Like deleted' });
        })
    },
};

export default LikeController;