import express from 'express';
import UserControllers from '../controllers/userControllers.js';
import PostController from '../controllers/postController.js';
import verifyToke from '../middlewares/authHandling.js';
import CommentController from '../controllers/commentController.js';
import LikeController from '../controllers/likeController.js';
const router = express.Router();

// User routes
router.get('/users', UserControllers.index);
router.get('/user/:userId', UserControllers.show);

// Post routes
router.get('/posts',verifyToke, PostController.getPosts);
router.post('/posts',verifyToke, PostController.createPost);

// Comment routes
router.get('/posts/:postId/comments',verifyToke, CommentController.getComments);
router.post('/posts/:postId/comments',verifyToke, CommentController.createComment);

// Like routes
router.get('/posts/:postId/likes', verifyToke, LikeController.getLikes);
router.post('/posts/:postId/likes', verifyToke, LikeController.createLike);
router.delete('/posts/:postId/likes', verifyToke, LikeController.deleteLike);

// Follow routes
router.get('/user/:userId/followers', verifyToke, UserControllers.getFollowers);
router.get('/user/:userId/following', verifyToke, UserControllers.getFollowing);
router.post('/user/:userId/followers', verifyToke, UserControllers.followUser);
router.delete('/user/:userId/followers', verifyToke, UserControllers.unfollowUser);

export default router;