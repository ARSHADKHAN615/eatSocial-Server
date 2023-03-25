import express from 'express';
import UserControllers from '../controllers/userControllers.js';
import PostController from '../controllers/postController.js';
import verifyToke from '../middlewares/authHandling.js';
import CommentController from '../controllers/commentController.js';
import LikeController from '../controllers/likeController.js';
import CartController from '../controllers/cartController.js';
import OrderController from '../controllers/orderController.js';
import MessageController from '../controllers/MessageController.js';
const router = express.Router();

// User routes
router.get('/user/:userId', UserControllers.show);
router.put('/user', verifyToke, UserControllers.update);
router.get('/users/most-followers', UserControllers.getUsersWhichHaveMostFollowers);
// User search
router.get('/users', UserControllers.search);


// Post routes
router.get('/posts', verifyToke, PostController.getPosts);
router.get('/post/:postId', verifyToke, PostController.getPost);
router.post('/posts', verifyToke, PostController.createPost);
router.put('/posts/:postId', verifyToke, PostController.updatePost);
router.delete('/posts/:postId', verifyToke, PostController.deletePost);
router.get('/posts/filter', verifyToke, PostController.getFilteredPosts);

// Comment routes
router.get('/posts/:postId/comments',verifyToke, CommentController.getComments);
router.post('/posts/:postId/comments',verifyToke, CommentController.createComment);

// Like routes
// router.get('/posts/:postId/likes', verifyToke, LikeController.getLikes);
router.post('/posts/:postId/likes', verifyToke, LikeController.createLike);
router.delete('/posts/:postId/likes', verifyToke, LikeController.deleteLike);

// Follow routes
// router.get('/user/:userId/followers', verifyToke, UserControllers.getFollowers);
// router.get('/user/:userId/following', verifyToke, UserControllers.getFollowing);
router.post('/user/:userId/followers', verifyToke, UserControllers.followUser);
router.delete('/user/:userId/followers', verifyToke, UserControllers.unfollowUser);

// Cart routes
router.get('/cart', verifyToke, CartController.getCart);
router.post('/cart', verifyToke, CartController.addToCart);
router.delete('/cart/:cartId', verifyToke, CartController.deleteFromCart);

// Order routes
router.get('/orders', verifyToke, OrderController.getOrders);
router.post('/orders', verifyToke, OrderController.createOrder);
router.get('/getsOrders', verifyToke, OrderController.userGetsOrdersProducts);
router.put('/order-product-status', verifyToke, OrderController.productApprove);

// Messaging routes
router.get('/conversations', verifyToke, MessageController.getConversations);
router.get('/conversation/:conversationId', verifyToke, MessageController.getConversation);
router.post('/conversation', verifyToke, MessageController.createConversation);
router.post('/message', verifyToke, MessageController.createMessage);
router.get('/messages/:conversationId', verifyToke, MessageController.getMessages);



export default router;