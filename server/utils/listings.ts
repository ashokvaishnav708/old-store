import { eq } from 'drizzle-orm';
import { useDb } from '~~/server/database/client';
import { listings, listingImages } from '~~/server/database/schema';

export async function deleteListingWithImages(id: string) {
  const db = useDb();

  const images = await db
    .select({ url: listingImages.url })
    .from(listingImages)
    .where(eq(listingImages.listingId, id));

  await db.delete(listings).where(eq(listings.id, id));

  await Promise.allSettled(images.map(img => deleteListingImage(img.url.split('/').pop()!)));
  await invalidate(`listing:${id}`, 'listings:list:*');
}
