const { z } = require('zod');

exports.registerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Name must contain only letters and spaces'),
        email: z.string().email().max(255),
        password: z.string().min(8).max(100)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number'),
    }),
});

exports.loginSchema = z.object({
    body: z.object({
        email: z.string().email().max(255),
        password: z.string().min(6).max(100),
    }),
});
