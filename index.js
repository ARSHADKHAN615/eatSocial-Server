import express from 'express';
const app = express();
import Routes from './routes/index.js';
import AuthRoutes from './routes/auth.js';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import verifyToke from './middlewares/authHandling.js';
import http from 'http';
import { Server } from 'socket.io';
import SocketEvents from './socketEvents.js';


// Create a new HTTP server with the Express app
const server = http.createServer(app);


// Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(server, { cors: { origin: '*' } });


const corsOptions = {
    origin: true,
    credentials: true,
};

const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
dotenv.config();

// ROUTES
app.use('/api', Routes);
app.use('/api/auth', AuthRoutes);

// SOCKET.IO
SocketEvents.init(io);


// FILE UPLOAD
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '../client/public/uploads');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname);
//     }
// })
// const upload = multer({ storage: storage })

// // Post Image Upload
// app.post('/api/upload', [upload.single('file'), verifyToke], (req, res) => {
//     const file = req.file;
//     res.status(200).json({ message: 'File uploaded', file: file.filename });
// });


// ERROR HANDLING
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    res.status(status).json({ error: message });
});

// START SERVER
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
