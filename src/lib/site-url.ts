// Public address of the site, without trailing slash.
// Uses NEXT_PUBLIC_SITE_URL if set; otherwise on Vercel it uses the production domain
// (the custom domain once one is attached, else the .vercel.app address).
export const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return 'http://localhost:3000'
}
