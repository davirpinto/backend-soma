const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // fallback for dev
const JWT_EXPIRES_IN = '24h';

exports.hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

exports.comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

exports.generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
