import { randomBytes, createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { passwordResetTokens } from '~~/server/database/schema';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex');
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString('hex');
  const db = useDb();

  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS)
  });

  return rawToken;
}

export async function consumePasswordResetToken(rawToken: string): Promise<string | null> {
  const db = useDb();
  const tokenHash = hashToken(rawToken);

  const record = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date())
    )
  });

  if (!record) return null;

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, record.id));

  return record.userId;
}
