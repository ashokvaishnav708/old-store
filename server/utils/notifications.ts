import { useDb } from '~~/server/database/client';
import { notifications, type NotificationType } from '~~/server/database/schema';

export interface NotifyUserInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  senderId?: string;
}

export async function notifyUser(input: NotifyUserInput) {
  const db = useDb();
  await db.insert(notifications).values({
    userId: input.userId,
    senderId: input.senderId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link
  });
}
