import { getSettings, hex } from '@/lib/payload'

export const dynamic = 'force-static'

// Browser-tab icon generated from the brand colour and short name in Site settings.
export async function GET() {
  const s = await getSettings()
  const label = (s.shortName || 'SMA').slice(0, 4).replace(/[<>&"']/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${hex(s.primaryColor, '#0b5d3b')}"/><text x="32" y="41" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } })
}
