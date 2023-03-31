import OrderModel from "../Models/Order.js";
import transporter from "../mailConf.js";
import createError from "../middlewares/errorHandling.js";
import Razorpay from "razorpay";
import crypto from "crypto";

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
    razorpayOrder: async (req, res, next) => {
        const { total } = req.body;
        try {
            const RazorpayInstance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
            const options = {
                amount: total * 100,
                currency: "INR",
                receipt: crypto.randomBytes(16).toString('hex'),
            };
            const order = RazorpayInstance.orders.create(options, (err, order) => {
                if (err) {
                    return next(err);
                }
                res.status(200).json(order);
            });
        } catch (err) {
            return next(err);
        }
    },
    paymentVerification: async (req, res, next) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        try {
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");
            if (razorpay_signature === expectedSign) {
                return res.status(200).json({ message: "Payment verified successfully", razorpay_payment_id });
            } else {
                return next(createError(400, "Payment verification failed"));
            }
        } catch (err) {
            return next(err);
        }
    },

    createOrder: async (req, res, next) => {
        const { address, city, state, zipcode, country, phone, email, total, payment_method, cart, razorpay_payment_id } = req.body;

        try {

            const row = await OrderModel.createOrder(req);
            const order_id = row.insertId;

            if (!order_id) {
                return next(createError(500, 'Order not created'));
            }

            // Discount price
            const discountPrice = (price, discount) => {
                const discountPrice = discount ? price - (price * discount) / 100 : price;
                return Number(discountPrice).toFixed(2);
            };

            // Send email
            const mailOptions = {
                from: 'eatSocial@store.in',
                to: email,
                subject: 'Order Placed',
                html: ` <h1>Thank you for your order</h1> <p>Order ID: ${order_id}</p> <p>Order Total: ${total}</p> <p>Payment Method: ${payment_method == '2' ? 'Cash on Delivery' : 'Online Payment'}</p> ${razorpay_payment_id ? `<p>Razorpay Payment ID: ${razorpay_payment_id}</p>` : ''}
                <p>Order Status: Pending</p> <p>Order Date: ${new Date().toLocaleString()}</p> <table style="width:100%; border: 1px solid black; border-collapse: collapse;"> <tr style="border: 1px solid black; border-collapse: collapse;"> <th style="border: 1px solid black; border-collapse: collapse;">Product</th> <th style="border: 1px solid black; border-collapse: collapse;">Quantity</th> <th style="border: 1px solid black; border-collapse: collapse;">Price</th> </tr> ${cart.map((item) => `<tr style="border: 1px solid black; border-collapse: collapse;"> <td style="border: 1px solid black; border-collapse: collapse;">${item.title}</td> <td style="border: 1px solid black; border-collapse: collapse;">${item.qty}</td> <td style="border: 1px solid black; border-collapse: collapse;">${discountPrice(item.price, item.discount)} (${item.discount}% off)</td> </tr>`).join('')} </table> <p>Shipping Address: ${address}, ${city}, ${state}, ${zipcode}, ${country}</p> <p>Phone: ${phone}</p> <p>Email: ${email}</p> <p>Thank you for shopping with us.</p> <p>Regards,</p> <p>eatSocial</p>`,
            };
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) return next(err);
            });

            res.status(201).json({ message: 'Order created', order_id });
        } catch (err) {
            return next(err);
        }
    },
    userGetsOrdersProducts: async (req, res, next) => {
        try {
            const row = await OrderModel.userGetsOrdersProducts(req);
            if (!row.length) {
                return next(createError(404, 'No orders found'));
            }
            const getOrderOnProduct = await Promise.all(row.map(async product => {
                const order = await OrderModel.getOrder(product.order_id);
                return {
                    ...order,
                    products: row.filter(product => product.order_id === order.order_id)
                }
            }));
            const orders = getOrderOnProduct.filter((order, index, self) => index === self.findIndex((t) => (t.order_id === order.order_id)))
            res.status(200).json(orders.sort((a, b) => new Date(b.createdAt
            ) - new Date(a.createdAt
            )));
        } catch (err) {
            return next(err);
        }
    },
    productApprove: async (req, res, next) => {
        try {
            const row = await OrderModel.productStatus(req);
            if (!row.affectedRows) {
                return next(createError(404, 'Order not found'));
            } else {
                const { order_id } = req.body;
                const order = await OrderModel.getOrder(order_id);
                // check if all products are approved
                const products = await OrderModel.getOrderProducts(order_id);

                const isAllApproved = products.every(product => product.approve_status === 1);
                if (isAllApproved) {
                    await OrderModel.updateOrderStatus(order_id, 3);

                    // Send email to user for order approval
                    const mailOptions = {
                        from: 'eatSocial@store.in',
                        to: order.email,
                        subject: 'Order Confirmation',
                        html: `<h1>Thank you for your order</h1> <p>Order ID: ${order_id}</p> <p>Order Total: ${order.order_total}</p> <p>Payment Method: ${order.payment_method == '2' ? 'Cash on Delivery' : 'Online Payment'}</p> <p>Order Status: Approved</p> <p>Order Date: ${new Date().toLocaleString()}</p> <table style="width:100%; border: 1px solid black; border-collapse: collapse;"> <tr style="border: 1px solid black; border-collapse: collapse;"> <th style="border: 1px solid black; border-collapse: collapse;">Product</th> <th style="border: 1px solid black; border-collapse: collapse;">Quantity</th>${products.map((item) => `<tr style="border: 1px solid black; border-collapse: collapse;"> <td style="border: 1px solid black; border-collapse: collapse;">${item.title}</td> <td style="border: 1px solid black; border-collapse: collapse;">${item.totalQ}</td> </tr>`).join('')} </table> <p>Shipping Address: ${order.address}, ${order.city}, ${order.state}, ${order.zipcode}, ${order.country}</p> <p>Phone: ${order.phone}</p> <p>Email: ${order.email}</p> <p>Thank you for shopping with us.</p> <p>Regards,</p> <p>eatSocial</p>`,
                    };
                    transporter.sendMail(mailOptions, (err, data) => {
                        if (err) return next(err);
                    });
                }

                // check any product is rejected
                const isAnyRejected = products.some(product => product.approve_status === 2);
                if (isAnyRejected && req.body.status === 2) {
                    await OrderModel.updateOrderStatus(order_id, 2);
                    // Send email to customer for order rejected
                    const mailOptions = {
                        from: 'eatSocial@store.in',
                        to: order.email,
                        subject: 'Order Rejected',
                        html: `<h1>Thank you for your order</h1> <p>Order ID: ${order_id}</p> <p>Order Total: ${order.order_total}</p> <p>Payment Method: ${order.payment_method == '2' ? 'Cash on Delivery' : 'Online Payment'}</p> <p>Order Status: Rejected</p> <p>Order Date: ${new Date().toLocaleString()}</p> <table style="width:100%; border: 1px solid black; border-collapse: collapse;"> <tr style="border: 1px solid black; border-collapse: collapse;"> <th style="border: 1px solid black; border-collapse: collapse;">Product</th> <th style="border: 1px solid black; border-collapse: collapse;">Quantity</th>${products.map((item) => `<tr style="border: 1px solid black; border-collapse: collapse;"> <td style="border: 1px solid black; border-collapse: collapse;">${item.title}</td> <td style="border: 1px solid black; border-collapse: collapse;">${item.totalQ}</td> </tr>`).join('')} </table> <p>Shipping Address: ${order.address}, ${order.city}, ${order.state}, ${order.zipcode}, ${order.country}</p> <p>Phone: ${order.phone}</p> <p>Email: ${order.email}</p> <p>Thank you for shopping with us.</p> <p>Regards,</p> <p>eatSocial</p>`,
                    };
                    transporter.sendMail(mailOptions, (err, data) => {
                        if (err) throw err;
                    });
                }

            }
            res.status(200).json({ message: 'Order status updated' });
        } catch (err) {
            return next(err);
        }
    },

}

export default OrderController