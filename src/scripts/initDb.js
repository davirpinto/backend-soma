const db = require('../config/db');

const createTables = async () => {
    try {
        console.log('⏳ Initializing database tables...');

        // Users Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Users table ready');

        // Assessments Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        contact_info JSONB,
        status VARCHAR(50) DEFAULT 'in_progress',
        economic_profile JSONB,
        maturity_answers JSONB,
        results JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Assessments table ready');

        console.log('🚀 Database initialization complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing database:', err);
        process.exit(1);
    }
};

createTables();
