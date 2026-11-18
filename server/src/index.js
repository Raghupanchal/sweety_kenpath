const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Sweety API server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
