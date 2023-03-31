import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

export const db2 = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
}).promise();

