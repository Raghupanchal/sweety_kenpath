const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test DB connection before listening
pool.query('SELECT NOW()')
  .then((res) => {
    console.log(` Connected to PostgreSQL successfully at ${res.rows[0].now}`);
    app.listen(PORT, () => {
      console.log(` Sweety API server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    console.error('Please ensure PostgreSQL is running and check your .env database credentials.');
    // Start server anyway so health checks and informative errors can be returned
    app.listen(PORT, () => {
      console.log(`⚠️ Sweety API server running in degraded mode on port ${PORT} (Database offline)`);
    });
  });
