export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  await rateLimit(`ratelimit:resend-verification:${user.id}`, 5, 60 * 60);

  if (user.verified) {
    return { success: true };
  }

  const config = useRuntimeConfig();
  const rawToken = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, `${config.public.baseUrl}/verify-email?token=${rawToken}`);

  return { success: true };
});
