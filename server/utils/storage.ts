import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { useRuntimeConfig } from '#imports';

let client: S3Client | undefined;

function useS3() {
  if (!client) {
    const config = useRuntimeConfig();
    client = new S3Client({
      endpoint: config.s3.endpoint as string,
      region: config.s3.region as string,
      credentials: {
        accessKeyId: config.s3.accessKeyId as string,
        secretAccessKey: config.s3.secretAccessKey as string
      },
      // MinIO (and most self-hosted S3-compatible stores) need path-style URLs.
      forcePathStyle: true
    });
  }
  return client;
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function uploadListingImage(fileName: string, contentType: string, data: Buffer) {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Only JPEG, PNG, WebP or AVIF images are allowed.'
    });
  }
  if (data.byteLength > MAX_SIZE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Image must be smaller than 8MB.' });
  }

  const config = useRuntimeConfig();
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${randomUUID()}.${ext}`;

  await useS3().send(
    new PutObjectCommand({
      Bucket: config.s3.bucket as string,
      Key: key,
      Body: data,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable'
    })
  );

  return {
    key,
    url: `${config.s3.publicUrl}/${key}`
  };
}

export async function deleteListingImage(key: string) {
  const config = useRuntimeConfig();
  await useS3().send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucket as string,
      Key: key
    })
  );
}
