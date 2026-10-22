'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import { type ContactState, submitMessage } from './actions'

export function ContactForm({ topics }: { topics: string[] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitMessage, { ok: false })
  const [startedAt, setStartedAt] = useState('')
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => setStartedAt(String(Date.now())), [])
  useEffect(() => {
    if (state.ok) form.current?.reset()
  }, [state])

  return (
    <form ref={form} action={action}>
      <div className="row">
        <label>Full name<input required name="name" autoComplete="name" maxLength={120} /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
      </div>
      <label>Email<input required name="email" type="email" autoComplete="email" maxLength={200} /></label>
      <div className="row">
        <label>Ward / Community<input name="ward" maxLength={120} /></label>
        <label>
          I want to
          <select name="topic">{topics.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
      </div>
      <label>Message<textarea name="message" maxLength={5000} /></label>
      {/* Spam traps */}
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button className="btn btn-green" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send Message'}</button>
      {state.ok && <p className="form-msg" role="status">Thank you! The office will be in touch.</p>}
      {state.error && <p className="form-msg error" role="alert">{state.error}</p>}
    </form>
  )
}
