import nodemailer from 'nodemailer';
import { useRuntimeConfig } from '#imports';

let transport: nodemailer.Transporter | undefined;

function useMailer() {
  if (!transport) {
    const config = useRuntimeConfig();
    transport = nodemailer.createTransport({
      host: config.smtp.host as string,
      port: Number(config.smtp.port),
      secure: false,
      auth: config.smtp.user ? { user: config.smtp.user as string, pass: config.smtp.pass as string } : undefined
    });
  }
  return transport;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const config = useRuntimeConfig();
  await useMailer().sendMail({
    from: config.smtp.from as string,
    to,
    subject: 'Reset your password',
    html: `
      <p>A password reset was requested for your account.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const config = useRuntimeConfig();
  await useMailer().sendMail({
    from: config.smtp.from as string,
    to,
    subject: 'Verify your email',
    html: `
      <p>Welcome to ${config.public.appName}! Please confirm your email address to finish setting up your account.</p>
      <p><a href="${verifyUrl}">Click here to verify your email</a>. This link expires in 1 hour.</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    `
  });
}
