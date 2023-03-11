import db from "../connect.js";

const CartController = {
    getCart: (req, res, next) => {

        const query = 'SELECT p.id AS postId,p.title,p.price,p.desc,p.qty AS totalQ,c.* FROM cart AS c LEFT JOIN posts AS p ON c.postId = p.id WHERE c.userId = ?';

        db.query(query, [req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(200).json(data);
        })
    },
    addToCart: (req, res, next) => {
        const query = 'INSERT INTO cart (qty, postId, userId) VALUES (?, ?, ?)';
        const { postId, qty } = req.body;

        db.query(query, [qty, postId, req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(201).json({ message: 'Added to cart' });
        })

    },
    deleteFromCart: (req, res, next) => {
        const query = 'DELETE FROM cart WHERE cart_id = ? AND userId = ?';
        const { cartId } = req.params;

        db.query(query, [cartId, req.user.id], (err, data) => {
            if (err) return next(err);
            res.status(200).json({ message: 'Deleted from cart' });
        })
    }
};

export default CartController;