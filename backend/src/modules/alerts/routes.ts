import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { sosLimiter } from '../../middleware/rateLimit';
import { logActivity } from '../../utils/activity';

const router = Router();
router.use(protect);

const createAlertSchema = z.object({
  alertType: z.string().optional(),
  message: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationLabel: z.string().trim().max(200).optional(),
});

// POST /api/alerts — activate an SOS / emergency alert
router.post('/', sosLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createAlertSchema.parse(req.body);

  // Only allow one active alert per user at a time.
  const active = await prisma.emergencyAlert.findFirst({
    where: { userId: req.userId, status: { in: ['ACTIVATING', 'ACTIVE'] } },
  });
  if (active) throw new AppError('You already have an active alert', 409);

  const alert = await prisma.emergencyAlert.create({
    data: {
      userId: req.userId,
      status: 'ACTIVE',
      alertType: data.alertType || 'SOS',
      message: data.message || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationLabel: data.locationLabel || null,
      activatedAt: new Date(),
    },
  });
  await logActivity(req.userId, 'SOS_ACTIVATED', { alertId: alert.id });
  res.status(201).json({ alert });
}));

// GET /api/alerts — current user's alert history
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alerts = await prisma.emergencyAlert.findMany({
    where: { userId: req.userId },
    orderBy: { activatedAt: 'desc' },
  });
  res.json({ alerts });
}));

// GET /api/alerts/active — the user's currently active alert (if any)
router.get('/active', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alert = await prisma.emergencyAlert.findFirst({
    where: { userId: req.userId, status: { in: ['ACTIVATING', 'ACTIVE'] } },
  });
  res.json({ alert: alert ?? null });
}));

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// POST /api/alerts/:id/locations — record a live location update during an active alert
router.post('/:id/locations', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = locationSchema.parse(req.body);
  const alert = await prisma.emergencyAlert.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!alert) throw new AppError('Alert not found', 404);
  if (!['ACTIVATING', 'ACTIVE'].includes(alert.status)) {
    throw new AppError('This alert is not active', 400);
  }
  const location = await prisma.locationUpdate.create({
    data: { alertId: alert.id, latitude: data.latitude, longitude: data.longitude },
  });
  res.status(201).json({ location });
}));

// GET /api/alerts/:id/locations — get the location history for an alert
router.get('/:id/locations', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alert = await prisma.emergencyAlert.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!alert) throw new AppError('Alert not found', 404);
  const locations = await prisma.locationUpdate.findMany({
    where: { alertId: alert.id },
    orderBy: { timestamp: 'asc' },
  });
  res.json({ locations });
}));

// GET /api/alerts/:id
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const alert = await prisma.emergencyAlert.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!alert) throw new AppError('Alert not found', 404);
  res.json({ alert });
}));

// PATCH /api/alerts/:id — resolve/cancel an alert
router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({ status: z.enum(['RESOLVED', 'CANCELLED']) });
  const { status } = schema.parse(req.body);

  const alert = await prisma.emergencyAlert.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!alert) throw new AppError('Alert not found', 404);
  if (!['ACTIVATING', 'ACTIVE'].includes(alert.status)) {
    throw new AppError('This alert is already closed', 400);
  }

  const updated = await prisma.emergencyAlert.update({
    where: { id: alert.id },
    data: { status, resolvedAt: new Date(), resolvedBy: 'USER' },
  });
  await logActivity(req.userId, 'SOS_' + status, { alertId: alert.id });
  res.json({ alert: updated });
}));

export const alertsRouter = router;

