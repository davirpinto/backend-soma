const { z } = require('zod');

// Helper for enum validation
const maturityLevelEnum = ['1', '2', '3', '4', '5'];
const clientTypeEnum = ['b2b', 'b2c', 'b2b-b2c'];

exports.createAssessmentSchema = z.object({
  body: z.object({
    contactInfo: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      role: z.string().min(2).max(100),
      companyName: z.string().min(2).max(200),
      employees: z.number().min(1).max(1000000),
      industry: z.string().min(2).max(100),
      clientType: z.enum(clientTypeEnum),
      maturityLevel: z.enum(maturityLevelEnum),
      description: z.string().max(1000).optional(),
    }),
  }),
});

exports.updateContactInfoSchema = exports.createAssessmentSchema; // Same validation

exports.updateEconomicProfileSchema = z.object({
  body: z.object({
    economicProfile: z.object({
      responses: z.record(z.string(), z.any()),
    }).refine((data) => {
      // Validate logic: 8 questions, 5 years
      const questionIds = Object.keys(data.responses);
      if (questionIds.length !== 8) return false;
      // Detailed validation could go here, but minimal check for structural integrity
      return true;
    }, { message: "Must answer all 8 economic questions" }),
  }),
});

exports.updateMaturityAnswersSchema = z.object({
  body: z.object({
    maturityAnswers: z.record(z.string(), z.number().min(0).max(5))
      .refine((data) => Object.keys(data).length === 45, {
        message: "Must answer all 45 maturity questions",
      }),
  }),
});
