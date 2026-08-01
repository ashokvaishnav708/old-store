import { randomBytes, createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { emailVerificationTokens } from '~~/server/database/schema';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}

export async function createEmailVerificationToken(userId: string) {
  const rawToken = randomBytes(32).toString('hex');
  const db = useDb();

  await db.insert(emailVerificationTokens).values({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS)
  });

  return rawToken;
}

export async function consumeEmailVerificationToken(rawToken: string): Promise<string | null> {
  const db = useDb();
  const tokenHash = hashToken(rawToken);

  const record = await db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(emailVerificationTokens.tokenHash, tokenHash),
      isNull(emailVerificationTokens.usedAt),
      gt(emailVerificationTokens.expiresAt, new Date())
    )
  });

  if (!record) return null;

  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.id, record.id));

  return record.userId;
}
