import db from '../connect.js';
import createError from '../middlewares/errorHandling.js';

const PostController = {
    getPosts: (req, res, next) => {

        const userId = req.query.userId;
        console.log(userId);

        const query = userId ? 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) p.userId = ? ORDER BY p.createdAt DESC' : 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId = ? OR p.userId = ? ORDER BY p.createdAt DESC';

        const values = userId  ? [userId] : [req.user.id, req.user.id];
        console.log(values);

        db.query(query, values, (err, data) => {
            if (err) return next(err);
            res.status(200).json(data); 
        })
    },
    createPost: (req, res, next) => {
        const query = "INSERT INTO posts (`userId`, `desc`,`img` ,`createdAt`) VALUES (?, ?,?, NOW())";
        const { desc, img } = req.body;
        const imgVal = img[0].response.file;
        console.log(imgVal);
        db.query(query, [req.user.id, desc, imgVal], (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Post created' });
        })

    }
}

export default PostController;