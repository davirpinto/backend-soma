const db = require('../config/db');
const { calculateAssessmentResults } = require('../services/calculationService');

// Helper to check ownership and return camelCase object
const checkOwnership = async (assessmentId, userId) => {
  const result = await db.query('SELECT * FROM assessments WHERE id = $1', [assessmentId]);
  const assessment = result.rows[0];

  if (!assessment) return null;
  if (assessment.user_id !== userId) throw new Error('Forbidden');

  // Map snake_case database fields to camelCase
  return {
    ...assessment,
    userId: assessment.user_id,
    contactInfo: assessment.contact_info,
    economicProfile: assessment.economic_profile,
    maturityAnswers: assessment.maturity_answers,
    completedAt: assessment.completed_at,
    createdAt: assessment.created_at
  };
};

exports.create = async (req, res) => {
  try {
    const { contactInfo } = req.body;
    const result = await db.query(
      `INSERT INTO assessments (user_id, contact_info, status) 
       VALUES ($1, $2, 'in_progress') 
       RETURNING *`,
      [req.user.userId, contactInfo]
    );

    const assessment = result.rows[0];

    // Return camelCase
    res.status(201).json({
      ...assessment,
      userId: assessment.user_id,
      contactInfo: assessment.contact_info,
      status: assessment.status
    });
  } catch (err) {
    console.error('Create Assessment Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    let assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status === 'completed') return res.status(400).json({ error: 'Assessment completed' });

    const result = await db.query(
      'UPDATE assessments SET contact_info = $1 WHERE id = $2 RETURNING *',
      [req.body.contactInfo, req.params.id]
    );

    const updated = result.rows[0];
    res.json({ ...updated, contactInfo: updated.contact_info, userId: updated.user_id });
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEconomicProfile = async (req, res) => {
  try {
    let assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const result = await db.query(
      'UPDATE assessments SET economic_profile = $1 WHERE id = $2 RETURNING *',
      [req.body.economicProfile, req.params.id]
    );

    const updated = result.rows[0];
    res.json({ ...updated, economicProfile: updated.economic_profile, userId: updated.user_id });
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMaturityAnswers = async (req, res) => {
  try {
    let assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const result = await db.query(
      'UPDATE assessments SET maturity_answers = $1 WHERE id = $2 RETURNING *',
      [req.body.maturityAnswers, req.params.id]
    );

    const updated = result.rows[0];
    res.json({ ...updated, maturityAnswers: updated.maturity_answers, userId: updated.user_id });
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.calculate = async (req, res) => {
  try {
    let assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status === 'completed') return res.status(400).json({ error: 'Already completed' });

    // Validate completeness
    if (!assessment.contactInfo || !assessment.economicProfile || !assessment.maturityAnswers) {
      return res.status(400).json({ error: 'Incomplete assessment data' });
    }

    const answers = assessment.maturityAnswers;
    if (Object.keys(answers).length !== 45) {
      return res.status(400).json({ error: 'Missing maturity answers' });
    }

    const results = calculateAssessmentResults(answers);

    const result = await db.query(
      `UPDATE assessments 
       SET results = $1, status = 'completed', completed_at = $2 
       WHERE id = $3 
       RETURNING *`,
      [results, new Date(), req.params.id]
    );

    const updated = result.rows[0];
    res.json({
      ...updated,
      results: updated.results,
      completedAt: updated.completed_at,
      userId: updated.user_id
    });
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const assessment = await checkOwnership(req.params.id, req.user.userId);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.status !== 'completed') return res.status(400).json({ error: 'Assessment not completed' });

    res.json({
      id: assessment.id,
      companyName: assessment.contactInfo.companyName,
      completedAt: assessment.completedAt,
      results: assessment.results,
    });
  } catch (err) {
    if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: 'Internal server error' });
  }
};
