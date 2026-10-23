'use client'

import { useState } from 'react'

export function SyncNowButton({ disabled }: { disabled?: boolean }) {
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const sync = async () => {
    setState('syncing')
    setMessage('')
    try {
      const r = await fetch('/cron/social-sync', { method: 'POST', credentials: 'include' })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`)
      setState(json.ok ? 'done' : 'error')
      setMessage(json.summary)
      // Reload so the list and the "last sync" summary show the new posts.
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Sync failed')
    }
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <button
        type="button"
        className="btn btn--style-primary btn--size-small"
        style={{ margin: 0 }}
        onClick={sync}
        disabled={disabled || state === 'syncing'}
      >
        {state === 'syncing' ? 'Syncing…' : 'Sync now'}
      </button>
      {message && (
        <div style={{ fontSize: 13, marginTop: 6, whiteSpace: 'pre-wrap', color: state === 'error' ? 'var(--theme-error-500)' : undefined }}>
          {message}
        </div>
      )}
    </div>
  )
}
