import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback;
  if (val === undefined || val === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  emailProvider: process.env.EMAIL_PROVIDER ?? 'dev',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  argonMemory: Number(process.env.ARCON2_MEMORY ?? 65536),
  argonTime: Number(process.env.ARCON2_TIME ?? 3),
  argonParallelism: Number(process.env.ARCON2_PARALLELISM ?? 1),
};
