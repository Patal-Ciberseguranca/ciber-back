import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetociber',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 999,
  maxIdle: 999, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  return new Promise((resolve, reject) => {
      if (err) {
          if (err.code === 'PROTOCOL_CONNECTION_LOST') {
              reject('Database connection was closed.');
          }
          if (err.code === 'ER_CON_COUNT_ERROR') {
              reject('Database has too many connections.');
          }
          if (err.code === 'ECONNREFUSED') {
              reject('Database connection was refused.');
          }
      }
      if (connection) connection.release()
      resolve();
  });
});

module.exports = pool;