import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { logActivity } from '../../utils/activity';

const router = Router();
router.use(protect);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
});

// GET /api/users/me
router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
}));

// PATCH /api/users/me
router.patch('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
  });
  await logActivity(user.id, 'UPDATE_PROFILE');
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  });
}));

// DELETE /api/users/me
router.delete('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: req.userId } }),
    prisma.user.delete({ where: { id: req.userId } }),
  ]);
  res.json({ success: true, message: 'Account deleted' });
}));

export const userRouter = router;

