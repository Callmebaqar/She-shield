import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { asyncHandler } from '../../utils/errors';
import { logActivity } from '../../utils/activity';
import { EMERGENCY_NUMBERS, WHATSAPP_NUMBER, REPORT_CATEGORIES, ALERT_TYPES } from '../../utils/constants';

const router = Router();

// GET /api/config — public app configuration (emergency numbers etc.)
router.get('/', (req, res) => {
  res.json({
    appName: 'SheShield',
    emergencyNumbers: EMERGENCY_NUMBERS,
    whatsappNumber: WHATSAPP_NUMBER,
    reportCategories: REPORT_CATEGORIES,
    alertTypes: ALERT_TYPES,
  });
});

const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(2000),
});

router.post('/contact', asyncHandler(async (req, res) => {
  const data = contactSchema.parse(req.body);
  await logActivity(null, 'CONTACT_FORM', { name: data.name, email: data.email || 'anonymous', message: data.message });
  res.json({ message: 'Thank you for your feedback!' });
}));

export const configRouter = router;
