import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { logActivity } from '../../utils/activity';
import { verifyPassword } from '../../utils/hash';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
router.use(protect);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  physicalDescription: z.string().trim().max(500).optional().nullable(),
});

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
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
      physicalDescription: user.physicalDescription,
      profilePhoto: user.profilePhoto,
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
      ...(data.physicalDescription !== undefined ? { physicalDescription: data.physicalDescription } : {}),
    },
  });
  await logActivity(user.id, 'UPDATE_PROFILE');
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  });
}));

// DELETE /api/users/me
router.delete('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { password } = z.object({ password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AppError('Incorrect password', 400);
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: req.userId } }),
    prisma.user.delete({ where: { id: req.userId } }),
  ]);
  res.json({ success: true, message: 'Account deleted' });
}));

// POST /api/users/me/photo
router.post('/me/photo', upload.single('photo'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.profilePhoto) {
    const oldPath = path.resolve(uploadDir, user.profilePhoto);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const filename = req.file.filename;
  await prisma.user.update({ where: { id: req.userId }, data: { profilePhoto: filename } });
  await logActivity(req.userId, 'UPDATE_PHOTO');
  res.json({ photo: filename });
}));

// DELETE /api/users/me/photo
router.delete('/me/photo', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.profilePhoto) {
    const filePath = path.resolve(uploadDir, user.profilePhoto);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await prisma.user.update({ where: { id: req.userId }, data: { profilePhoto: null } });
  res.json({ success: true });
}));

export const userRouter = router;
