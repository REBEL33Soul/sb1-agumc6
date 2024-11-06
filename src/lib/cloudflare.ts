import { R2 } from '@aws-sdk/client-s3';

const r2 = new R2({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (file: Buffer, key: string, contentType: string) => {
  await r2.putObject({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  return `https://${process.env.CLOUDFLARE_R2_BUCKET}.r2.dev/${key}`;
};

export const deleteFromR2 = async (key: string) => {
  await r2.deleteObject({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Key: key,
  });
};