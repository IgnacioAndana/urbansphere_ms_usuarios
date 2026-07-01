import { registerAs } from '@nestjs/config';

function resolverProveedor(): 'smtp' | 'resend' {
  const configurado = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (configurado === 'smtp' || configurado === 'resend') {
    return configurado;
  }
  return process.env.SMTP_HOST ? 'smtp' : 'resend';
}

export default registerAs('email', () => ({
  provider: resolverProveedor(),
  resendApiKey: process.env.RESEND_API_KEY || '',
  from: process.env.MAIL_FROM || process.env.RESEND_FROM || 'onboarding@resend.dev',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}));
