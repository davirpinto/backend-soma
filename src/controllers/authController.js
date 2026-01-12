const db = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Email already exists', code: 'EMAIL_EXISTS' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const result = await db.query(
            'INSERT INTO users (name, email, password, last_login_at) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at',
            [name, email, hashedPassword, new Date()]
        );

        const newUser = result.rows[0];

        // Generate token
        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
        });

        res.status(201).json({
            token,
            user: newUser,
        });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
        }

        // Update last login
        await db.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [new Date(), user.id]);

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.me = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Me Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
