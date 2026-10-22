export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <img src="/favicon.svg" alt="" width={52} height={52} style={{ borderRadius: 12 }} />
      <span style={{ lineHeight: 1.2 }}>
        <strong style={{ display: 'block', fontSize: 18 }}>Hon. Saidu Musa Abdullahi</strong>
        <span style={{ opacity: 0.7, fontSize: 14 }}>Website admin</span>
      </span>
    </div>
  )
}
