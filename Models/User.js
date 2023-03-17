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
}
export default UserModel