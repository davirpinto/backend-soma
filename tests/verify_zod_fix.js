const { z } = require('zod');
const schemas = require('../src/utils/assessmentSchemas');

console.log('Zod version:', require('zod/package.json').version);

const economicPayload = {
    body: {
        economicProfile: {
            responses: {
                "1": { "2024": 100 },
                "2": { "2024": 100 },
                "3": { "2024": 100 },
                "4": { "2024": 100 },
                "5": { "2024": 100 },
                "6": { "2024": 100 },
                "7": { "2024": 100 },
                "8": { "2024": 100 }
            }
        }
    }
};

const maturityPayload = {
    body: {
        maturityAnswers: Object.fromEntries(
            Array.from({ length: 45 }, (_, i) => [String(i + 1), Math.floor(Math.random() * 5) + 1])
        )
    }
};

try {
    console.log('Verifying updateEconomicProfileSchema...');
    schemas.updateEconomicProfileSchema.parse(economicPayload);
    console.log('Success: updateEconomicProfileSchema');

    console.log('Verifying updateMaturityAnswersSchema...');
    schemas.updateMaturityAnswersSchema.parse(maturityPayload);
    console.log('Success: updateMaturityAnswersSchema');
} catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
}
