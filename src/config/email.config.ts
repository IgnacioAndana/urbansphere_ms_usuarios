import { registerAs } from '@nestjs/config';

function trim(valor?: string): string {
  return valor?.trim() ?? '';
}

export default registerAs('email', () => ({
  apiKey: trim(process.env.BREVO_API_KEY),
  from: trim(process.env.MAIL_FROM),
  fromName: trim(process.env.MAIL_FROM_NAME) || 'UrbanSphere',
}));
