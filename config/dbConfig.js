// database.js
import mysql from 'mysql2';

// base de datos del servidor
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'nshlturi_farmacias',
//   password: 'Farmacias123',
//   database: 'nshlturi_farmacias',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'farmacias_webapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool.promise(); // Exportamos la pool con promesas
