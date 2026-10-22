import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="article" style={{ textAlign: 'center' }}>
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p className="lead" style={{ margin: '12px auto 28px' }}>The page you are looking for has moved or no longer exists.</p>
      <Link className="btn btn-green" href="/">Back to the home page</Link>
    </div>
  )
}
