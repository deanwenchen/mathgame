import { Router, type Request, type Response } from 'express';

const router = Router();

// GET /api/v1/quiz - Get quiz list
router.get('/', (req: Request, res: Response) => {
  const { grade, knowledgePoint, limit = 10 } = req.query;

  // TODO: Implement quiz service
  // For now, return sample quizzes
  const sampleQuizzes = [
    {
      id: 'quiz-001',
      type: 'calculate',
      knowledgePoint: 'addition',
      difficulty: 1,
      question: '3 + 5 = ?',
      answer: '8',
      explanation: 'Add the two numbers together: 3 + 5 = 8',
      grade: 1,
      estimatedTime: 30
    },
    {
      id: 'quiz-002',
      type: 'calculate',
      knowledgePoint: 'subtraction',
      difficulty: 1,
      question: '10 - 4 = ?',
      answer: '6',
      explanation: 'Subtract the second number from the first: 10 - 4 = 6',
      grade: 1,
      estimatedTime: 30
    },
    {
      id: 'quiz-003',
      type: 'choice',
      knowledgePoint: 'multiplication',
      difficulty: 2,
      question: '7 x 8 = ?',
      options: ['54', '56', '58', '64'],
      answer: '56',
      explanation: 'Use multiplication table: 7 x 8 = 56',
      grade: 2,
      estimatedTime: 45
    }
  ];

  // Filter by grade if provided
  let filteredQuizzes = sampleQuizzes;
  if (grade) {
    filteredQuizzes = filteredQuizzes.filter(q => q.grade === parseInt(grade as string));
  }
  if (knowledgePoint) {
    filteredQuizzes = filteredQuizzes.filter(q => q.knowledgePoint === knowledgePoint);
  }

  res.json({
    success: true,
    data: filteredQuizzes.slice(0, parseInt(limit as string) || 10),
    meta: {
      total: filteredQuizzes.length,
      page: 1,
      limit: parseInt(limit as string) || 10
    }
  });
});

// GET /api/v1/quiz/random - Get random quiz
router.get('/random', (req: Request, res: Response) => {
  const { grade = 1, difficulty = 1 } = req.query;

  // TODO: Implement quiz service with actual random selection from database
  const randomQuiz = {
    id: `quiz-${Date.now()}`,
    type: 'calculate' as const,
    knowledgePoint: 'addition',
    difficulty: parseInt(difficulty as string) || 1,
    question: '5 + 7 = ?',
    answer: '12',
    explanation: 'Add the two numbers together: 5 + 7 = 12',
    grade: parseInt(grade as string) || 1,
    estimatedTime: 30
  };

  res.json({
    success: true,
    data: randomQuiz
  });
});

// POST /api/v1/quiz/submit - Submit answer
router.post('/submit', (req: Request, res: Response) => {
  const { quizId, userAnswer, timeSpent } = req.body;

  // TODO: Implement actual quiz validation and battle logic
  // For now, simulate a response

  // Sample quiz answers (in real implementation, fetch from database)
  const quizAnswers: Record<string, { answer: string; explanation: string }> = {
    'quiz-001': { answer: '8', explanation: 'Add the two numbers together: 3 + 5 = 8' },
    'quiz-002': { answer: '6', explanation: 'Subtract the second number from the first: 10 - 4 = 6' },
    'quiz-003': { answer: '56', explanation: 'Use multiplication table: 7 x 8 = 56' }
  };

  const quizData = quizAnswers[quizId] || { answer: userAnswer, explanation: 'Answer submitted' };
  const isCorrect = userAnswer.toString().trim() === quizData.answer.toString().trim();

  const response = {
    success: true,
    data: {
      isCorrect,
      correctAnswer: quizData.answer,
      explanation: quizData.explanation,
      damageDealt: isCorrect ? 20 : 0,
      damageReceived: isCorrect ? 0 : 10,
      currentHp: 100 - (isCorrect ? 0 : 10),
      enemyHp: 50 - (isCorrect ? 20 : 0),
      timeSpent: timeSpent || 0
    }
  };

  res.json(response);
});

// POST /api/v1/quiz/generate - Generate quiz
router.post('/generate', (req: Request, res: Response) => {
  const { grade, type, knowledgePoint, difficulty, count = 1 } = req.body;

  // TODO: Implement quiz generation algorithm
  // For now, return generated sample quizzes

  const quizzes = [];
  for (let i = 0; i < Math.min(count, 10); i++) {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    quizzes.push({
      id: `gen-quiz-${Date.now()}-${i}`,
      type: type || 'calculate',
      knowledgePoint: knowledgePoint || 'addition',
      difficulty: difficulty || 1,
      question: `${num1} + ${num2} = ?`,
      answer: (num1 + num2).toString(),
      explanation: `Add the two numbers together: ${num1} + ${num2} = ${num1 + num2}`,
      grade: grade || 1,
      estimatedTime: 30
    });
  }

  res.json({
    success: true,
    data: quizzes
  });
});

export default router;