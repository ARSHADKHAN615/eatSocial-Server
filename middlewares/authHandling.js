import jwt from 'jsonwebtoken';
import createError from './errorHandling.js';


const verifyToke = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return next(createError(401, "You are Not Authenticate!"));

    jwt.verify(token, process.env.JWT_SECRET, (err, userId) => {
        if (err) return next(createError(403, "Authentication Failed!"));
        req.user = userId;
        next();
    })
}

export default verifyToke;