import bcrypt from 'bcryptjs';
import db from '../connect.js';
import jwt from 'jsonwebtoken';
import createError from '../middlewares/errorHandling.js';

const AuthController = {
    login: (req, res, next) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [req.body.username], (err, result) => {
            if (err) {
                return next(err);
            }
            if (result.length > 0) {
                bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                    if (response) {
                        const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET);
                        const { password, ...user } = result[0];
                        res.cookie("accessToken", token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'none',
                        }).status(200).json(user);
                        return;
                    } else {
                        return next(createError(401, 'Wrong password'));
                    }
                });
            } else {
                return next(createError(404, 'User not found'));
            }
        });
    },
    register: (req, res, next) => {
        // CHECK IF USER EXISTS
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [req.body.username], (err, result) => {
            if (err) {
                return next(err);
            }
            if (result.length > 0) {
                return next(createError(409, 'User already exists'));
            } else {
                // Hash the password
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                // Create a new user
                const query = 'INSERT INTO users (username, email, password,name,createdAt) VALUES (?, NOW())';

                const values = [req.body.username, req.body.email, hash, req.body.name];

                db.query(query, [values], (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    res.status(201).json({ message: 'User created' });
                });
            }
        });


    },
    logout: (req, res) => {
        res.clearCookie('accessToken', { httpOnly: true, secure: false }).status(200).json({ message: 'Logged out' });
    }
}

export default AuthController;