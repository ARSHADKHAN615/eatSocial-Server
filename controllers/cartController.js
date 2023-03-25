import CartModel from "../Models/Cart.js";

const CartController = {
    getCart: async (req, res, next) => {
        try {
            const row = await CartModel.getCart(req);
            res.status(200).json(row);
        } catch (err) {
            return next(err);
        }
    },
    addToCart: async (req, res, next) => {
        try {
            const row = await CartModel.addToCart(req);
            res.status(201).json({ message: 'Added to cart' });
        } catch (err) {
            return next(err);
        }
    },
    deleteFromCart: async (req, res, next) => {
        const { cartId } = req.params;
        try {
            const row = CartModel.deleteFromCart(req, cartId);
            res.status(200).json({ message: 'Deleted from cart' });
        } catch (err) {
            return next(err);
        }
    }
};

export default CartController;