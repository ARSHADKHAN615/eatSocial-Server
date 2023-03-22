import { db2 } from "../connect.js";


const PostModel = {
    getPosts: async (req, userId) => {

        const query = userId ? 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC' : 'SELECT p.*,u.id AS userId,u.name,u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId = ? OR p.userId = ? GROUP BY p.id ORDER BY p.createdAt DESC';



        const values = userId ? [userId] : [req.user.id, req.user.id];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    getLikes: async (req, postId) => {
        const query = 'SELECT * FROM likes WHERE postId = ?';
        try {
            const [row] = await db2.query(query, [postId]);
            return row;
        } catch (err) {
            throw err;
        }
    },

    createPost: async (req) => {
        const query = "INSERT INTO posts (`userId`, `title`, `desc`, `img` , `is_for_sell`, `price`, `qty`, `discount`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        const { title, desc, img, isForSale, price, qty, discount } = req.body;
        const imgVal = img[0]?.xhr || img[0]?.url;

        const values = [req.user.id, title, desc, imgVal, isForSale, price, qty, discount];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    updatePost: async (req) => {
        const query = "UPDATE posts SET `title` = ?, `desc` = ?, `img` = ?, `is_for_sell` = ?, `price` = ?, `qty` = ?, `discount` = ? WHERE id = ? AND userId = ?";
        const { title, desc, img, isForSale, price, qty, discount } = req.body;
        
        const imgVal = img[0]?.xhr || img[0]?.url;
        const { postId } = req.params;

        const values = [title, desc, imgVal, isForSale, price, qty, discount, postId, req.user.id];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    deletePost: async (req) => {
        const query = 'DELETE FROM posts WHERE id = ? AND userId = ?';
        const { postId } = req.params;
        try {
            const [row] = await db2.query(query, [postId, req.user.id]);
            return row;
        } catch (err) {
            throw err;
        }
    },

};

export default PostModel;