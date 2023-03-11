import db from '../connect.js';
import createError from '../middlewares/errorHandling.js';

const PostController = {
    getPosts: (req, res, next) => {

        const userId = req.query.userId == 'undefined' ? null : req.query.userId;

        const query = userId ? 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC' : 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId = ? OR p.userId = ? ORDER BY p.createdAt DESC';

        const values = userId ? [userId] : [req.user.id, req.user.id];

        db.query(query, values, (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        })
    },
    createPost: (req, res, next) => {
        const query = "INSERT INTO posts (`userId`, `title`, `desc`, `img` , `is_for_sell`, `price`, `qty`, `discount`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        const { title, desc, img, isForSale, price, qty, discount } = req.body;
        const imgVal = img[0]?.xhr || img[0]?.url;

        const values = [req.user.id, title, desc, imgVal, isForSale, price, qty, discount];

        db.query(query, values, (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Post created' });
        })

    },
    deletePost: (req, res, next) => {
        const query = 'DELETE FROM posts WHERE id = ? AND userId = ?';
        const { postId } = req.params;
        db.query(query, [postId, req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(200).json({ message: 'Post deleted' });
        })
    },
}

export default PostController;