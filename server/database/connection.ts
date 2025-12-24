import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'mada_user',
  password: process.env.DB_PASSWORD || 'mada_password',
  database: process.env.DB_NAME || 'mada_requests',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectAttributes: {
    charset: 'utf8mb4',
  },
});

// Ensure UTF-8 encoding for all queries
pool.on('connection', (connection) => {
  connection.query('SET NAMES utf8mb4');
  connection.query('SET CHARACTER SET utf8mb4');
  connection.query('SET character_set_connection=utf8mb4');
});

export default pool;
