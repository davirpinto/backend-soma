// Scoring Logic
const categories = {
  financial: { questions: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], weight: 1 },
  market_client: { questions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11'], weight: 1 },
  processes: { questions: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'], weight: 1 },
  customer_relationship: { questions: ['cr1', 'cr2', 'cr3', 'cr4', 'cr5', 'cr6', 'cr7', 'cr8', 'cr9', 'cr10'], weight: 1 },
  growth: { questions: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'], weight: 1 }
};

function calculateCategoryScore(answers, questionIds) {
  let totalPoints = 0;
  let maxPossiblePoints = 0;
  let applicableQuestions = 0;

  questionIds.forEach(qId => {
    const answer = answers[qId];
    if (answer === 0) {
      return; // "Não se aplica"
    }
    applicableQuestions++;
    totalPoints += answer;
    maxPossiblePoints += 5;
  });

  if (applicableQuestions === 0) return 0;
  const percentage = (totalPoints / maxPossiblePoints) * 100;
  return Math.round(percentage);
}

function calculateOverallScore(categoryScores) {
  const scores = Object.values(categoryScores);
  const validScores = scores.filter(score => score > 0);
  if (validScores.length === 0) return 0;
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
}

function getMaturityLevel(overallScore) {
  if (overallScore >= 80) return "Otimizado";
  if (overallScore >= 60) return "Avançado";
  if (overallScore >= 40) return "Estabelecido";
  if (overallScore >= 20) return "Em desenvolvimento";
  return "Inicial";
}

function analyzeResults(categoryScores) {
  const entries = Object.entries(categoryScores);
  entries.sort((a, b) => b[1] - a[1]);
  const topStrength = entries[0][0]; 
  const areasForImprovement = entries
    .filter(([_, score]) => score < 60 && score > 0)
    .map(([category, _]) => category);
  return { topStrength, areasForImprovement };
}

exports.calculateAssessmentResults = (maturityAnswers) => {
  const breakdown = {
    financial: calculateCategoryScore(maturityAnswers, categories.financial.questions),
    market_client: calculateCategoryScore(maturityAnswers, categories.market_client.questions),
    processes: calculateCategoryScore(maturityAnswers, categories.processes.questions),
    customer_relationship: calculateCategoryScore(maturityAnswers, categories.customer_relationship.questions),
    growth: calculateCategoryScore(maturityAnswers, categories.growth.questions)
  };

  const overallScore = calculateOverallScore(breakdown);
  const maturityLevel = getMaturityLevel(overallScore);
  const { topStrength, areasForImprovement } = analyzeResults(breakdown);

  return {
    overallScore,
    maturityLevel,
    breakdown,
    topStrength,
    areasForImprovement
  };
};
