import { db2 } from "../connect.js";


const OrderModel = {
    getOrders: async (req) => {
        const query = "SELECT o.*,os.name AS orderStatus FROM orders AS o LEFT JOIN order_status AS os ON (o.order_status_id = os.order_status_id) WHERE o.customer_id = ? ORDER BY o.createdAt DESC";

        const values = [req.user.id];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    getOrder: async (orderId) => {
        const query = "SELECT o.*,os.name AS orderStatus FROM orders AS o LEFT JOIN order_status AS os ON (o.order_status_id = os.order_status_id) WHERE o.order_id = ? ORDER BY o.createdAt DESC";
        try {
            const [row] = await db2.query(query, [orderId]);
            return row[0];
        } catch (err) {
            throw err;
        }
    },
    getOrderProducts: async (orderId) => {
        const query = "SELECT op.*,p.title,p.price,p.discount,p.img FROM order_products AS op JOIN posts AS p ON (op.postId = p.id) WHERE op.order_id = ?";

        try {
            const [row] = await db2.query(query, [orderId]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    createOrder: async (req) => {

        //----------------------------- Insert order
        const query = "INSERT INTO orders (`firstName`, `lastName`, `address`, `city`, `state`, `zipcode`, `country`, `phone`, `email`, `customer_id`, `order_total`, `payment_method`,`razorpay_payment_id`,`order_status_id`,`createdAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,NOW())";

        const { firstname, lastname, address, city, state, zipcode, country, phone, email, total, payment_method,razorpay_payment_id, cart } = req.body;

        const values = [firstname, lastname, address, city, state, zipcode, country, phone, email, req.user.id, total, payment_method,razorpay_payment_id];

        try {
            const [OrderInsertedRow] = await db2.query(query, values);

            //----------------------------- Insert order items
            const order_id = OrderInsertedRow.insertId;
            const insertQueryForOrderItems = "INSERT INTO order_products (`order_id`, `totalQ`,`postId`,`userId`,`sellerId`,`approve_status`) VALUES (?, ?, ?, ?,?, ?)";

            const orderItems = Promise.all(cart.map(async (item) => {
                const values = [order_id, item.qty, item.postId, item.userId, item.sellerId, 0];
                const [InsertedRow] = await db2.query(insertQueryForOrderItems, values);
                return InsertedRow;
            }));

            //------------------------------ Delete cart items
            const deleteQueryForCartItems = "DELETE FROM cart WHERE cart_id IN (?)";
            const cartIds = cart.map((item) => item.cart_id);
            const [DeletedRow] = await db2.query(deleteQueryForCartItems, [cartIds]);


            //------------------------------ Update product quantity
            const updateQueryForProductQuantity = "UPDATE posts SET qty = qty - ? WHERE id = ?";
            const products = Promise.all(cart.map(async (item) => {
                const [updatedRow] = await db2.query(updateQueryForProductQuantity, [item.qty, item.postId]);
                return updatedRow;
            }));


            return OrderInsertedRow;
        } catch (err) {
            throw err;
        }

    },
    userGetsOrdersProducts: async (req) => {
        const query = "SELECT op.*,p.title,p.price,p.discount,p.img FROM order_products AS op JOIN posts AS p ON (op.postId = p.id) WHERE op.sellerId = ?";
        const values = [req.user.id];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    productStatus: async (req) => {
        const query = "UPDATE order_products SET approve_status = ? WHERE order_product_id = ?";
        const values = [req.body.status, req.body.id];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    updateOrderStatus: async (orderId, status) => {
        const query = "UPDATE orders SET order_status_id = ? WHERE order_id = ?";
        const values = [status, orderId];

        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },

};

export default OrderModel;