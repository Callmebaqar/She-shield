import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { AppError, asyncHandler } from '../../utils/errors';
import { protect, type AuthRequest } from '../../middleware/auth';
import { logActivity } from '../../utils/activity';

const router = Router();
router.use(protect);

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  phone: z.string().trim().min(7, 'A valid phone number is required').max(20),
  relation: z.string().trim().max(40).optional().nullable(),
  isPrimary: z.boolean().optional(),
});

// GET /api/emergency-contacts
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: req.userId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  res.json({ contacts });
}));

// POST /api/emergency-contacts
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = contactSchema.parse(req.body);
  const count = await prisma.emergencyContact.count({ where: { userId: req.userId } });
  if (count >= 5) throw new AppError('You can save up to 5 emergency contacts', 400);

  if (data.isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { userId: req.userId },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.emergencyContact.create({
    data: {
      userId: req.userId,
      name: data.name,
      phone: data.phone,
      relation: data.relation ?? null,
      isPrimary: data.isPrimary ?? false,
    },
  });
  await logActivity(req.userId, 'ADD_EMERGENCY_CONTACT', { contactId: contact.id });
  res.status(201).json({ contact });
}));

// PATCH /api/emergency-contacts/:id
router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = contactSchema.partial().parse(req.body);
  const existing = await prisma.emergencyContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) throw new AppError('Contact not found', 404);

  if (data.isPrimary) {
    await prisma.emergencyContact.updateMany({
      where: { userId: req.userId },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.emergencyContact.update({
    where: { id: existing.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.relation !== undefined ? { relation: data.relation } : {}),
      ...(data.isPrimary !== undefined ? { isPrimary: data.isPrimary } : {}),
    },
  });
  await logActivity(req.userId, 'EDIT_EMERGENCY_CONTACT', { contactId: contact.id });
  res.json({ contact });
}));

// DELETE /api/emergency-contacts/:id
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.emergencyContact.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) throw new AppError('Contact not found', 404);
  await prisma.emergencyContact.delete({ where: { id: existing.id } });
  await logActivity(req.userId, 'DELETE_EMERGENCY_CONTACT', { contactId: existing.id });
  res.json({ success: true });
}));

export const contactsRouter = router;

