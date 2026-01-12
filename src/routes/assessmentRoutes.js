const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const validate = require('../middleware/validation');
const requireAuth = require('../middleware/auth');
const schemas = require('../utils/assessmentSchemas');

router.use(requireAuth); // All routes require auth

router.post('/', validate(schemas.createAssessmentSchema), assessmentController.create);
router.get('/:id', assessmentController.getOne);
router.patch('/:id/contact-info', validate(schemas.updateContactInfoSchema), assessmentController.updateContactInfo);
router.patch('/:id/economic-profile', validate(schemas.updateEconomicProfileSchema), assessmentController.updateEconomicProfile);
router.patch('/:id/maturity-answers', validate(schemas.updateMaturityAnswersSchema), assessmentController.updateMaturityAnswers);
router.post('/:id/calculate', assessmentController.calculate);
router.get('/:id/results', assessmentController.getResults);

module.exports = router;
