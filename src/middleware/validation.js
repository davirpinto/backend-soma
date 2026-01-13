const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        // Debug: Log do que está sendo recebido
        if (req.body?.economicProfile?.responses) {
            console.log('=== DEBUG: economicProfile.responses ===');
            console.log('Full request body:', JSON.stringify(req.body, null, 2));
            console.log('Content-Type:', req.get('Content-Type'));
            console.log('Type of responses:', typeof req.body.economicProfile.responses);
            console.log('Keys in responses:', Object.keys(req.body.economicProfile.responses));
            
            // Log de cada key e seu tipo
            Object.keys(req.body.economicProfile.responses).forEach(key => {
                const value = req.body.economicProfile.responses[key];
                console.log(`Key "${key}": type=${typeof value}, value=`, value);
            });
            console.log('=== END DEBUG ===');
        }
        
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
