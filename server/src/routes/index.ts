import { Router } from 'express';
import authRoutes from './auth.js';
import quizRoutes from './quiz.js';
import userRoutes from './user.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/quiz', quizRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'MathGame API',
      version: '1.0.0',
      description: 'Backend API for children\'s math learning game',
      endpoints: {
        auth: {
          'POST /api/v1/auth/register': 'Register new user',
          'POST /api/v1/auth/login': 'Login',
          'POST /api/v1/auth/logout': 'Logout',
          'POST /api/v1/auth/refresh': 'Refresh token'
        },
        users: {
          'GET /api/v1/users/me': 'Get current user info',
          'PUT /api/v1/users/me': 'Update user info',
          'GET /api/v1/users/me/characters': 'Get user characters',
          'POST /api/v1/users/me/characters': 'Create new character',
          'GET /api/v1/users/me/statistics': 'Get user statistics',
          'GET /api/v1/users/me/progress': 'Get learning progress'
        },
        quiz: {
          'GET /api/v1/quiz': 'Get quiz list',
          'GET /api/v1/quiz/random': 'Get random quiz',
          'POST /api/v1/quiz/submit': 'Submit answer',
          'POST /api/v1/quiz/generate': 'Generate quiz'
        }
      }
    }
  });
});

export default router;