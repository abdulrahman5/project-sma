// Build entry point (`npm run build`).
// Database migrations and first-run seeding only run for production builds, so Vercel preview
// deployments (other branches) never change the live database. Then the Next.js app is built.
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const isPreview = process.env.VERCEL_ENV === 'preview'

if (isPreview) {
  console.log('Preview deployment: skipping database migrations and seeding.')
} else {
  run('npx payload migrate')
  run('npx payload run src/seed/index.ts')
}
run('npx next build')
