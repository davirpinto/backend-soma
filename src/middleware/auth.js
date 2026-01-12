const { verifyToken } = require('../utils/auth');

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized', code: 'MISSING_TOKEN' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        // Optional: Check if user actually exists in DB still
        // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        // if (!user) throw new Error('User not found');

        req.user = decoded; // { userId, email, name: ... }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    }
};

module.exports = requireAuth;
