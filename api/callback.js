// Step 2 of admin login: GitHub sends the admin back here; we swap the code for a token
// and hand it to the admin panel window that opened the login popup.
export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookieState = /(?:^|;\s*)oauth_state=([^;]+)/.exec(req.headers.cookie || '')?.[1];

  let status = 'error';
  let content = { message: 'Login failed. Please close this window and try again.' };

  if (!code || !state || state !== cookieState) {
    content = { message: 'Login expired or was invalid. Please try again.' };
  } else {
    try {
      const r = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await r.json();
      if (data.access_token) {
        status = 'success';
        content = { token: data.access_token, provider: 'github' };
      } else {
        content = { message: data.error_description || 'GitHub did not return a token.' };
      }
    } catch {
      content = { message: 'Could not reach GitHub. Please try again.' };
    }
  }

  const payload = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, '\\u003c');
  res.setHeader('Set-Cookie', 'oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html><html><body><p>Signing you in…</p><script>
(function () {
  function receive(e) {
    if (e.origin !== window.location.origin) return;
    window.opener.postMessage(${payload}, e.origin);
    window.removeEventListener('message', receive);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', window.location.origin);
})();
</script></body></html>`);
}
