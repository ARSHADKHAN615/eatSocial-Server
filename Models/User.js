import { db2 } from "../connect.js";


const UserModel = {
    getUser: async (req) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM users WHERE id = ?';
        try {
            const [row] = await db2.query(query, [userId]);
            if (!row.length) throw new Error('User not found');
            const { password, ...userWithoutPassword } = row[0];
            return userWithoutPassword;
        } catch (err) {
            throw err;
        }
    },
    getUserByEmailAndUsername: async (username, email) => {
        const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
        try {
            const [row] = await db2.query(query, [email, username]);
            return row[0];
        } catch (err) {
            throw err;
        }
    },
    getUserByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        try {
            const [row] = await db2.query(query, [email]);
            return row[0];
        } catch (err) {
            throw err;
        }
    },
    getUserByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        try {
            const [row] = await db2.query(query, [username]);
            return row[0];
        } catch (err) {
            throw err;
        }
    },
    getUsersWhichHaveMostFollowers: async () => {
        const query = 'SELECT u.*,u.id AS userId,r.* FROM users AS u LEFT JOIN relationships AS r ON u.id = r.followedUserId GROUP BY u.id ORDER BY COUNT(r.followedUserId) DESC LIMIT 5';
        try {
            const [row] = await db2.query(query);
            return row;
        } catch (err) {
            throw err;
        }
    },
    createUser: async ({ username, email, password, name, profilePic }) => {
        const query = 'INSERT INTO users (username, email, password, name, profilePic, createdAt) VALUES (?, ?, ?, ?, ?, NOW())';
        const values = [username, email, password, name, profilePic];
        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    createUserGoogle: async ({ username, email, name, img }) => {
        const query = 'INSERT INTO users (username, email, name, profilePic, createdAt) VALUES (?, ?, ?, ?, NOW())';
        const values = [username, email, name, img];
        try {
            const [row] = await db2.query(query, values);
            return row;
        } catch (err) {
            throw err;
        }
    },
    userSearch: async (search) => {
        const query = 'SELECT * FROM users WHERE name LIKE ?';
        try {
            const [row] = await db2.query(query, [`%${search}%`]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    update: async (req) => {
        let { name, city, website, profilePic, coverPic } = req.body;

        const query = 'UPDATE users SET name = ?, city = ?, website = ?, profilePic = ?, coverPic = ? WHERE id = ?';

        profilePic = profilePic[0]?.xhr || profilePic[0]?.url;
        coverPic = coverPic[0]?.xhr || coverPic[0]?.url;

        const values = [name, city, website, profilePic, coverPic, req.user.id];

        try {
            const [row] = await db2.query(query, values);
            const [updated] = await db2.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
            const { password, ...userWithoutPassword } = updated[0];
            return userWithoutPassword;
        } catch (err) {
            throw err;
        }
    },
    getFollowing: async (req) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM users AS u LEFT JOIN relationships AS r ON u.id = r.followedUserId WHERE r.followerUserId = ?';
        try {
            const [row] = await db2.query(query, [userId]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    getFollowers: async (req) => {
        const { userId } = req.params;
        const query = 'SELECT * FROM  users AS u LEFT JOIN relationships AS r ON u.id = r.followerUserId WHERE r.followedUserId = ?';
        try {
            const [row] = await db2.query(query, [userId]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    followUser: async (req,userId) => {
        const query = 'INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?)';
        try {
            const [row] = await db2.query(query, [req.user.id, userId]);
            return row;
        } catch (err) {
            throw err;
        }
    },
    unfollowUser: async (req, userId) => {        
        const query = 'DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?';
        try {
            const [row] = await db2.query(query, [req.user.id, userId]);
            return row;
        } catch (err) {
            throw err;
        }
    },
}
export default UserModel