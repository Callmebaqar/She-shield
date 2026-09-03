import { Router } from 'express';
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

export const configRouter = router;

