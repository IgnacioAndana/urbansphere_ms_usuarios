import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
  passwordResetPath: process.env.PASSWORD_RESET_PATH || '/restablecer-contrasena',
  httpLogging: process.env.HTTP_LOGGING !== 'false',
}));
