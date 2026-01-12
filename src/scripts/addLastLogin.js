const db = require('../config/db');

const migrate = async () => {
    try {
        console.log('Running migration: Add last_login_at to users...');
        await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `);
        console.log('✅ Migration successful');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
