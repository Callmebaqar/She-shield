import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './utils/config';
import { errorHandler, notFoundHandler } from './utils/errors';
import { apiLimiter } from './middleware/rateLimit';
import { authRouter } from './modules/auth/routes';
import { userRouter } from './modules/users/routes';
import { contactsRouter } from './modules/contacts/routes';
import { alertsRouter } from './modules/alerts/routes';
import { reportsRouter } from './modules/reports/routes';
import { adminRouter } from './modules/admin/routes';
import { configRouter } from './modules/config/routes';

const app = express();

// Trust proxy for correct client IPs behind a reverse proxy (VPS/HTTPS).
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'sheshield', time: new Date().toISOString() });
});

app.use('/api', apiLimiter);

// Public
app.use('/api/config', configRouter);
app.use('/api/auth', authRouter);

// Protected
app.use('/api/users', userRouter);
app.use('/api/emergency-contacts', contactsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/reports', reportsRouter);

// Admin (role-guarded)
app.use('/api/admin', adminRouter);

// Fallback / SPA-aware catch-all for API is handled by notFoundHandler only.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`SheShield backend listening on http://localhost:${config.port}`);
});
