import { registerAs } from '@nestjs/config';

function trim(valor?: string): string {
  return valor?.trim() ?? '';
}

export default registerAs('email', () => ({
  smtp: {
    host: trim(process.env.BREVO_SMTP_HOST) || 'smtp-relay.brevo.com',
    port: parseInt(trim(process.env.BREVO_SMTP_PORT) || '587', 10),
    user: trim(process.env.BREVO_SMTP_USER),
    pass: trim(process.env.BREVO_SMTP_PASS),
  },
  from: trim(process.env.MAIL_FROM),
  fromName: trim(process.env.MAIL_FROM_NAME) || 'UrbanSphere',
}));
