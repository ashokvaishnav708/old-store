import type { H3Event } from 'h3';
import type { UserType } from '~~/server/database/schema';

const STAFF_TYPES: UserType[] = ['admin', 'assistant'];

export async function requireStaff(event: H3Event) {
  const { user } = await requireUserSession(event);
  if (!STAFF_TYPES.includes(user.userType)) {
    throw createError({ statusCode: 403, statusMessage: 'Staff access required.' });
  }
  return user;
}

export async function requireAdmin(event: H3Event) {
  const { user } = await requireUserSession(event);
  if (user.userType !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required.' });
  }
  return user;
}

export async function requireVerified(event: H3Event) {
  const { user } = await requireUserSession(event);
  if (!user.verified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Please verify your email address before continuing.'
    });
  }
  return user;
}
