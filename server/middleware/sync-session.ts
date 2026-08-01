import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { users } from '~~/server/database/schema';

interface SessionSnapshot {
  bannedAt: Date | null;
  name: string;
  avatarUrl: string | null;
  userType: 'admin' | 'assistant' | 'private' | 'organisation';
  verified: boolean;
}

/**
 * The session cookie is only ever updated explicitly (login/register/here) —
 * nuxt-auth-utils' `fetch` session hook (server/plugins/session.ts) only
 * corrects the payload of the `GET /api/_auth/session` polling response, it
 * does not persist back to the sealed cookie. So role/ban/verified changes
 * made elsewhere (e.g. an admin demoting an assistant, or email verification
 * completing) would otherwise be invisible to `requireStaff`/`requireAdmin`/
 * `requireVerified` — which read the session directly — until the user logs
 * out and back in. This middleware re-syncs the cookie from the DB on every
 * request (Redis-cached briefly to keep it cheap) so those checks stay
 * authoritative without forcing re-login.
 */
export default defineEventHandler(async event => {
  const session = await getUserSession(event);
  if (!session.user) return;

  const userId = session.user.id;
  const snapshot = await cached<SessionSnapshot | null>(`user:session-sync:${userId}`, 30, async () => {
    const db = useDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return null;
    return {
      bannedAt: user.bannedAt,
      name: `${user.firstName} ${user.lastName}`,
      avatarUrl: user.avatarUrl,
      userType: user.userType ?? 'private',
      verified: user.verified ?? false
    };
  });

  if (!snapshot || snapshot.bannedAt) {
    await clearUserSession(event);
    throw createError({ statusCode: 403, statusMessage: 'This account has been banned.' });
  }

  const { name, avatarUrl, userType, verified } = session.user;
  if (
    name !== snapshot.name ||
    avatarUrl !== snapshot.avatarUrl ||
    userType !== snapshot.userType ||
    verified !== snapshot.verified
  ) {
    await setUserSession(event, {
      user: { ...session.user, name: snapshot.name, avatarUrl: snapshot.avatarUrl, userType: snapshot.userType, verified: snapshot.verified }
    });
  }
});
