import UserModel from "../Models/User.js";
import db from "../connect.js";

const UserControllers = {
    // GET /user/:id
    show: async (req, res, next) => {
        try {
            const userData = await UserModel.getUser(req);
            const userFollowings = await UserModel.getFollowing(req);
            const userFollowers = await UserModel.getFollowers(req);
            res.status(200).json({ ...userData, followings: userFollowings, followers: userFollowers });
        } catch (err) {
            return next(err);
        }
    },
    // PUT /user
    update: async (req, res, next) => {
        try {
            const userData = await UserModel.update(req);
            res.status(200).json(userData);
        } catch (err) {
            return next(err);
        }
    },
    search: async (req, res, next) => {
        const { search } = req.query;
        try {
            const userData = await UserModel.userSearch(search);
            res.status(200).json(userData);
        } catch (err) {
            return next(err);
        }
    },
    followUser: async (req, res, next) => {
        const { userId } = req.params;
        const query = 'INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?)';
        db.query(query, [req.user.id, userId], (err, data) => {
            if (err) return next(err);
            res.status(200).json({ message: 'User followed' });
        })
    },
    unfollowUser: async (req, res, next) => {
        const { userId } = req.params;
        const query = 'DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?';
        db.query(query, [req.user.id, userId], (err, data) => {
            if (err) return next(err);
            res.status(200).json({ message: 'User unfollowed' });
        })
    },

}

export default UserControllers;