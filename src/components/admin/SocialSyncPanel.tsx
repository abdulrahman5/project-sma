import type { Payload } from 'payload'

import { SyncNowButton } from './SyncNowButton'

// Shown above the Social posts list: connection status, last sync result and a "Sync now" button.
export async function SocialSyncPanel({ payload }: { payload: Payload }) {
  const connected = Boolean(process.env.META_PAGE_ID && process.env.META_PAGE_ACCESS_TOKEN)
  const settings = await payload.findGlobal({ slug: 'social-settings', overrideAccess: true })
  const last = settings.lastSyncAt
    ? new Date(settings.lastSyncAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' })
    : 'never'

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
        <strong>Facebook &amp; Instagram: </strong>
        {connected ? (
          <span style={{ color: 'var(--theme-success-500)' }}>connected</span>
        ) : (
          <span style={{ color: 'var(--theme-warning-500)' }}>not connected yet — see the README for setup</span>
        )}
        <br />
        <span style={{ opacity: 0.75 }}>Last sync: {last}. Syncs automatically once a day.</span>
        {settings.lastSyncSummary && (
          <pre style={{ margin: '6px 0 0', fontFamily: 'inherit', whiteSpace: 'pre-wrap', opacity: 0.75 }}>{settings.lastSyncSummary}</pre>
        )}
      </div>
      <SyncNowButton disabled={!connected} />
    </div>
  )
}
