import UserModel from "../Models/User.js";

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
    getUsersWhichHaveMostFollowers: async (req, res, next) => {
        try {
            const users = await UserModel.getUsersWhichHaveMostFollowers();
            res.status(200).json(users);
        } catch (err) {
            return next(err);
        }
    },
    followUser: async (req, res, next) => {
        const { userId } = req.params;
        try {
            const data = await UserModel.followUser(req,userId);
            res.status(200).json({ message: 'User followed' });
        } catch (err) {
            return next(err);
        }
    },
    unfollowUser: async (req, res, next) => {
        const { userId } = req.params;
        try {
            const data = await UserModel.unfollowUser(req,userId);
            res.status(200).json({ message: 'User unfollowed' });
        } catch (err) {
            return next(err);
        }
    },

}

export default UserControllers;