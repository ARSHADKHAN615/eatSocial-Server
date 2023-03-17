import express from 'express';
import UserControllers from '../controllers/userControllers.js';
import PostController from '../controllers/postController.js';
import verifyToke from '../middlewares/authHandling.js';
import CommentController from '../controllers/commentController.js';
import LikeController from '../controllers/likeController.js';
import CartController from '../controllers/cartController.js';
import OrderController from '../controllers/orderController.js';
const router = express.Router();

// User routes
router.get('/user/:userId', UserControllers.show);
router.put('/user', verifyToke, UserControllers.update);

// User search
router.get('/users', UserControllers.search);


// Post routes
router.get('/posts',verifyToke, PostController.getPosts);
router.post('/posts', verifyToke, PostController.createPost);
router.put('/posts/:postId', verifyToke, PostController.updatePost);
router.delete('/posts/:postId', verifyToke, PostController.deletePost);

// Comment routes
router.get('/posts/:postId/comments',verifyToke, CommentController.getComments);
router.post('/posts/:postId/comments',verifyToke, CommentController.createComment);

// Like routes
router.get('/posts/:postId/likes', verifyToke, LikeController.getLikes);
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

export default router;