// Small mark in the admin top bar; uses the site's generated favicon (brand colour + short name).
export function Icon() {
  return <img src="/favicon.svg" alt="" width={28} height={28} style={{ display: 'block', borderRadius: 6 }} />
}
