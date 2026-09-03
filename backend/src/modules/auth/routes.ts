import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { config } from '../../utils/config';
import { randomToken, hashToken, signAuthToken } from '../../utils/token';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import { logActivity } from '../../utils/activity';

const router = Router();

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(80),
    email: z.string().trim().email('A valid email is required').max(160),
    password: strongPassword,
    confirmPassword: z.string(),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotSchema = z.object({ email: z.string().trim().email() });
const resetSchema = z.object({
  token: z.string().min(1),
  password: strongPassword,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function publicUser(u: {
  id: string; name: string; email: string; role: string; phone: string | null;
  emailVerified: boolean; isActive: boolean; createdAt: Date;
  physicalDescription?: string | null; profilePhoto?: string | null;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    physicalDescription: u.physicalDescription ?? null,
    profilePhoto: u.profilePhoto ?? null,
  };
}

// POST /api/auth/register
router.post('/register', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone || null,
    },
  });

  const session = await createSession(user.id, req);
  const token = signAuthToken({ sub: user.id, role: user.role, sid: session.id });
  await logActivity(user.id, 'REGISTER');

  res.status(201).json({ token, user: publicUser(user) });
}));

// POST /api/auth/login
router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);

  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) throw new AppError('Invalid email or password', 401);

  const session = await createSession(user.id, req);
  const token = signAuthToken({ sub: user.id, role: user.role, sid: session.id });
  await logActivity(user.id, 'LOGIN');

  res.json({ token, user: publicUser(user) });
}));

// POST /api/auth/logout
router.post('/logout', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.sessionId) {
    await prisma.session.deleteMany({ where: { id: req.sessionId, userId: req.userId } });
  }
  await logActivity(req.userId, 'LOGOUT');
  res.json({ success: true });
}));

// GET /api/auth/me
router.get('/me', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  res.json({ user: publicUser(user) });
}));

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return the same message to avoid user-enumeration.
  if (!user) {
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
    return;
  }

  const rawToken = randomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetLink = `${config.frontendUrl}/reset-password?token=${rawToken}`;
  await deliverResetEmail(user.email, resetLink);
  await logActivity(user.id, 'FORGOT_PASSWORD');

  res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
}));

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = resetSchema.parse(req.body);
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('This reset link is invalid or has expired', 400);
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  await logActivity(record.userId, 'RESET_PASSWORD');
  res.json({ message: 'Password updated. Please log in with your new password.' });
}));

// PATCH /api/auth/change-password (requires current password)
router.patch('/change-password', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: strongPassword,
  });
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw new AppError('Current password is incorrect', 400);

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: user.id, NOT: { id: req.sessionId } } }),
  ]);
  await logActivity(user.id, 'CHANGE_PASSWORD');
  res.json({ message: 'Password changed successfully' });
}));

async function createSession(userId: string, req: Request) {
  const expiresStr = config.jwtExpiresIn || '7d';
  const days = parseInt(expiresStr) || 7;
  return prisma.session.create({
    data: {
      userId,
      tokenHash: 'by-jwt-' + randomToken(),
      userAgent: (req.headers['user-agent'] as string)?.slice(0, 200) || null,
      ip: req.ip || null,
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    },
  });
}

async function deliverResetEmail(to: string, link: string) {
  if (config.emailProvider === 'dev' || !config.resendApiKey) {
    console.log('\n===== PASSWORD RESET (dev mode) =====');
    console.log(`To: ${to}`);
    console.log(`Reset link: ${link}`);
    console.log('=====================================\n');
    return;
  }
  console.warn('[Email] No email provider configured. Reset link not delivered:', link);
}

export const authRouter = router;

