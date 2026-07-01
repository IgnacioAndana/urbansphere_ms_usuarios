import { registerAs } from '@nestjs/config';

function trim(valor?: string): string {
  return valor?.trim() ?? '';
}

export default registerAs('email', () => ({
  token: trim(process.env.MAILTRAP_API_TOKEN),
  from: trim(process.env.MAIL_FROM),
  fromName: trim(process.env.MAIL_FROM_NAME) || 'UrbanSphere',
}));
