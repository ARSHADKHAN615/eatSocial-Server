import db from "../connect.js";

const UserControllers = {
    // GET /users
    index: (req, res) => {
        res.send('GET /users');
    },
    // GET /users/:id
    show: async (req, res, next) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], (err, data) => {
            if (err) return next(err);
            const user = data[0];
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        })
    },
    // PUT /user
    update: async (req, res, next) => {
        let { name, city, website, profilePic, coverPic } = req.body;

        const query = 'UPDATE users SET name = ?, city = ?, website = ?, profilePic = ?, coverPic = ? WHERE id = ?';

        profilePic = profilePic[0]?.xhr || profilePic[0]?.url;
        coverPic = coverPic[0]?.xhr || coverPic[0]?.url;

        const values = [name, city, website, profilePic, coverPic, req.user.id];

        db.query(query, values, (err, data, fields) => {
            if (err) return next(err);
            res.status(200).json({ message: 'User updated' });
        })
    },
    getFollowers: async (req, res, next) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM relationships AS r WHERE r.followedUserId = ?';
        db.query(query, [userId], (err, data) => {
            if (err) return next(err);
            res.status(200).json(data.map(user => user.followerUserId));
        })
    },
    getFollowing: async (req, res, next) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM relationships AS r WHERE r.followerUserId = ?';
        db.query(query, [userId], (err, data) => {
            if (err) return next(err);
            res.status(200).json(data.map(user => user.followedUserId));
        })

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