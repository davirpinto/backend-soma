const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next(); // Pass control if validation succeeds
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Validation Error Details:', JSON.stringify(err, null, 2));
            return res.status(400).json({
                error: 'Validation failed',
                details: err.errors ? err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })) : err.message,
            });
        }
        next(err);
    }
};

module.exports = validate;
