import { Router, type Request, type Response } from 'express';

const router = Router();

// POST /api/v1/auth/register - Register new user
router.post('/register', (req: Request, res: Response) => {
  const { role, nickname, grade, parentId } = req.body;

  // TODO: Implement user registration service
  // For now, return a mock user

  const newUser = {
    id: `user-${Date.now()}`,
    role: role || 'student',
    nickname: nickname || 'New Player',
    avatar: null,
    grade: grade || 1,
    parentId: parentId || null,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: {
      user: newUser,
      token: 'mock-jwt-token-placeholder'
    }
  });
});

// POST /api/v1/auth/login - Login
router.post('/login', (req: Request, res: Response) => {
  const { userId, parentId } = req.body;

  // TODO: Implement authentication service
  // For now, return a mock response

  const user = {
    id: userId || 'user-demo',
    role: 'student',
    nickname: 'Demo Player',
    avatar: null,
    grade: 1,
    parentId: parentId || null
  };

  res.json({
    success: true,
    data: {
      user,
      token: 'mock-jwt-token-placeholder'
    }
  });
});

// POST /api/v1/auth/logout - Logout
router.post('/logout', (_req: Request, res: Response) => {
  // TODO: Implement token invalidation

  res.json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
});

// POST /api/v1/auth/refresh - Refresh token
router.post('/refresh', (_req: Request, res: Response) => {
  // TODO: Implement token refresh

  res.json({
    success: true,
    data: {
      token: 'new-mock-jwt-token-placeholder'
    }
  });
});

export default router;