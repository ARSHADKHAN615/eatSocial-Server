import { db2 } from "../connect.js";

const CartModel = {
    getCart: async(req) => {
        const query = 'SELECT p.id AS postId,p.title,p.price,p.desc,p.discount,p.qty AS totalQ,p.userId AS sellerId,c.* FROM cart AS c LEFT JOIN posts AS p ON c.postId = p.id WHERE c.userId = ?';
        try {
            const [row] = await db2.query(query, [req.user.id]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    addToCart: async(req) => {
        const { postId, qty } = req.body;
        const query = 'INSERT INTO cart (`postId`, `userId`, `qty`) VALUES (?,?,?) ON DUPLICATE KEY UPDATE qty = qty + ?';
        try {
            const [row] = await db2.query(query, [postId, req.user.id, qty, qty]);
            return row;
        } catch (err) {
            throw err;
        }

    },
    deleteFromCart: async(req,cartId) => {
        const query = 'DELETE FROM cart WHERE cart_id = ? AND userId = ?';
        try {
            const [row] = await db2.query(query, [cartId, req.user.id]);
            return row;
        } catch (err) {
            throw err;
        }
    }
}

export default CartModel;