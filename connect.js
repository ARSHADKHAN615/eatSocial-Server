// import mysql from 'mysql';
import mysql2 from 'mysql2';
// const db1 = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'eatSocial'
// });

export const db2 = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eatSocial'
}).promise();


// export default db1;
