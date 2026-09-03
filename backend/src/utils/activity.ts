import type { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export async function logActivity(
  userId: string | null,
  action: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (e) {
    // Logging must never break a request.
    console.error('Failed to write activity log:', e);
  }
}
