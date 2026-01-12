require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Check DB connection
    const res = await db.query('SELECT NOW()');
    console.log('📦 Database connected successfully at:', res.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
