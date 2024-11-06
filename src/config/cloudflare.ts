export const cloudflareConfig = {
  token: import.meta.env.VITE_CLOUDFLARE_TOKEN,
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
  d1DatabaseId: import.meta.env.VITE_CLOUDFLARE_D1_ID,
  r2Bucket: import.meta.env.VITE_CLOUDFLARE_R2_BUCKET,
};