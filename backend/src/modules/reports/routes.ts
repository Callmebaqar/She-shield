import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { logActivity } from '../../utils/activity';

const router = Router();
router.use(protect);

const reportSchema = z.object({
  category: z.enum(['UNSAFE_AREA', 'HARASSMENT', 'SUSPICIOUS_ACTIVITY', 'ROAD_TRAVEL_SAFETY', 'OTHER']),
  description: z.string().trim().min(10, 'Please provide at least 10 characters').max(2000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationLabel: z.string().trim().max(200).optional(),
  occurredAt: z.string().datetime().optional(),
});

// POST /api/reports
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = reportSchema.parse(req.body);
  const report = await prisma.safetyReport.create({
    data: {
      userId: req.userId,
      category: data.category,
      description: data.description,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationLabel: data.locationLabel || null,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    },
  });
  await logActivity(req.userId, 'SUBMIT_REPORT', { reportId: report.id });
  res.status(201).json({ report });
}));

// GET /api/reports
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const reports = await prisma.safetyReport.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ reports });
}));

// GET /api/reports/:id
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await prisma.safetyReport.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!report) throw new AppError('Report not found', 404);
  res.json({ report });
}));

export const reportsRouter = router;

