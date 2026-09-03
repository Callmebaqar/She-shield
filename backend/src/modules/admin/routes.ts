import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, adminOnly, type AuthRequest } from '../../middleware/auth';
import { logActivity } from '../../utils/activity';

const router = Router();
router.use(protect);
router.use(adminOnly);

// GET /api/admin/stats
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const [totalUsers, activeAlerts, totalReports, pendingReports, recentActivity] =
    await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.emergencyAlert.count({ where: { status: { in: ['ACTIVATING', 'ACTIVE'] } } }),
      prisma.safetyReport.count(),
      prisma.safetyReport.count({ where: { status: 'SUBMITTED' } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  res.json({
    stats: {
      totalUsers,
      activeAlerts,
      totalReports,
      pendingReports,
      recentActivity,
    },
  });
}));

// GET /api/admin/users
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      isActive: true, createdAt: true,
      _count: { select: { emergencyAlerts: true, safetyReports: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
}));

// PATCH /api/admin/users/:id — toggle active / change role
router.patch('/users/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    isActive: z.boolean().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  });
  const data = schema.parse(req.body);

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: {
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
    },
  });
  await logActivity(req.userId, 'ADMIN_UPDATE_USER', { targetId: updated.id });
  res.json({ user: { id: updated.id, isActive: updated.isActive, role: updated.role } });
}));

// GET /api/admin/reports
router.get('/reports', asyncHandler(async (req: AuthRequest, res: Response) => {
  const reports = await prisma.safetyReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ reports });
}));

// GET /api/admin/alerts
router.get('/alerts', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alerts = await prisma.emergencyAlert.findMany({
    orderBy: { activatedAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ alerts });
}));

// PATCH /api/admin/reports/:id — update report status
router.patch('/reports/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']),
    adminNote: z.string().trim().max(500).optional(),
  });
  const data = schema.parse(req.body);

  const report = await prisma.safetyReport.findUnique({ where: { id: req.params.id } });
  if (!report) throw new AppError('Report not found', 404);

  const updated = await prisma.safetyReport.update({
    where: { id: report.id },
    data: { ...data, adminNote: data.adminNote ?? report.adminNote },
  });
  await logActivity(req.userId, 'ADMIN_UPDATE_REPORT', { reportId: updated.id, status: updated.status });
  res.json({ report: updated });
}));

export const adminRouter = router;

