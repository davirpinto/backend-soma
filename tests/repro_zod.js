const { z } = require('zod');

console.log('Zod version:', require('zod/package.json').version);

const updateEconomicProfileSchema = z.object({
    responses: z.record(z.string(), z.any())
});


const payload = {
    responses: { "1": { "foo": "bar" } }
};


try {
    console.log('Parsing...');
    updateEconomicProfileSchema.parse(payload);
    console.log('Success!');
} catch (err) {
    console.error('Error:', err);
}
