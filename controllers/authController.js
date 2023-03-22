import bcrypt from 'bcryptjs';
import db, { db2 } from '../connect.js';
import jwt from 'jsonwebtoken';
import createError from '../middlewares/errorHandling.js';
import { generateFromEmail } from 'unique-username-generator';
import UserModel from '../Models/User.js';

const AuthController = {
    login: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const user = await UserModel.getUserByUsername(username);
            if (!user) return next(createError(404, 'Username not found'));
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return next(createError(401, 'Password is incorrect'));
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
            const { RemovePassword, ...userWithoutPassword } = user;
            res.cookie("accessToken", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            }).status(200).json(userWithoutPassword);
        } catch (err) {
            return next(err);
        }
    },
    usernameExist: async (req, res, next) => {
        try {
            const { username } = req.query;
            const user = await UserModel.getUserByUsername(username);
            if (user) return res.status(200).json({ exist: true });
            return res.status(200).json({ exist: false });
        } catch (err) {
            return next(err);
        }
    },
    register: async (req, res, next) => {
        try {
            const { username, email, password, name, profilePic } = req.body;

            const user = await UserModel.getUserByEmailAndUsername(username, email);
            if (user) return next(createError(409, 'Email or Username already exists'));
             // Hash the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            // Get profile pic From Object
            const getProfilePic = profilePic[0]?.xhr;

             // Create a new user
            const newUser = await UserModel.createUser({ username, email, password: hash, name, profilePic: getProfilePic });

            res.status(201).json({ message: 'User created' });
        } catch (error) {
            return next(error);
        }
    },
    googleSignIn: async (req, res, next) => {
        try {
            const { name, email, img } = req.body;
            // check user
            const user = await UserModel.getUserByEmail(email);
            if (user) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
                const { password, ...others } = user;
                res.cookie("accessToken", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                }).status(200).json(others);
            } else {
                const username = generateFromEmail(email, 4);
                const newUser = await UserModel.createUserGoogle({
                    username, email, name, img
                });
                const token = jwt.sign({ id: newUser.insertId }, process.env.JWT_SECRET);
                const { password, ...others } = await UserModel.getUserByEmail(email);
                res.cookie("accessToken", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                }).status(200).json(others);
            }
        } catch (error) {
            return next(error);
        }
    },
    logout: (req, res) => {
        res.clearCookie("accessToken", { path: '/' })
        res.status(200).json({ message: "Logout Successfully" });
    }
}

export default AuthController;