import OrderModel from "../Models/Order.js";
import db from "../connect.js";
import transporter from "../mailConf.js";
import createError from "../middlewares/errorHandling.js";


const OrderController = {
    getOrders: async (req, res, next) => {
        try {
            const row = await OrderModel.getOrders(req);
            if (!row.length) {
                return next(createError(404, 'No orders found'));
            }

            const ordersWithProducts = await Promise.all(row.map(async order => {
                const products = await OrderModel.getOrderProducts(order.order_id);
                return {
                    ...order,
                    products
                }
            }));

            res.status(200).json(ordersWithProducts);
        } catch (err) {
            return next(err);
        }
    },
    createOrder: async (req, res, next) => {
        const { address, city, state, zipcode, country, phone, email, total, payment_method, cart } = req.body;

        try {
            const row = await OrderModel.createOrder(req);
            const order_id = row.insertId;

            // Discount price
            const discountPrice = (price, discount) => {
                const discountPrice = discount ? price - (price * discount) / 100 : price;
                return Number(discountPrice).toFixed(2);
            };

            // Send email
            const mailOptions = {
                from: 'eatSocial@store.in',
                to: email,
                subject: 'Order Confirmation',
                html: ` <h1>Thank you for your order</h1> <p>Order ID: ${order_id}</p> <p>Order Total: ${total}</p> <p>Payment Method: ${payment_method == '2' ? 'Cash on Delivery' : 'Online Payment'}</p> <p>Order Status: Pending</p> <p>Order Date: ${new Date().toLocaleString()}</p> <table style="width:100%; border: 1px solid black; border-collapse: collapse;"> <tr style="border: 1px solid black; border-collapse: collapse;"> <th style="border: 1px solid black; border-collapse: collapse;">Product</th> <th style="border: 1px solid black; border-collapse: collapse;">Quantity</th> <th style="border: 1px solid black; border-collapse: collapse;">Price</th> </tr> ${cart.map((item) => `<tr style="border: 1px solid black; border-collapse: collapse;"> <td style="border: 1px solid black; border-collapse: collapse;">${item.title}</td> <td style="border: 1px solid black; border-collapse: collapse;">${item.qty}</td> <td style="border: 1px solid black; border-collapse: collapse;">${discountPrice(item.price, item.discount)} (${item.discount}% off)</td> </tr>`).join('')} </table> <p>Shipping Address: ${address}, ${city}, ${state}, ${zipcode}, ${country}</p> <p>Phone: ${phone}</p> <p>Email: ${email}</p> <p>Thank you for shopping with us.</p> <p>Regards,</p> <p>eatSocial</p>`,
            };
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) throw err;
            });

            res.status(201).json({ message: 'Order created', order_id });
        } catch (err) {
            return next(err);
        }
    },

}

export default OrderController