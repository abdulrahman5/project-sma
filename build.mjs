// Builds the static site in dist/ from the editable files in content/.
// Content is edited by admins at /admin (Decap CMS), which commits to GitHub; Vercel then re-runs this build.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const site = readJson('content/site.json');
const about = readJson('content/about.json');
const agenda = readJson('content/agenda.json');

const projects = fs.readdirSync(path.join(ROOT, 'content/projects'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson(`content/projects/${f}`))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

const posts = fs.readdirSync(path.join(ROOT, 'content/news'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(ROOT, 'content/news', f), 'utf8'));
    return { ...data, slug: f.replace(/\.md$/, ''), date: new Date(data.date), html: marked.parse(content) };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => b.date - a.date);

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isPh = (s) => /^\s*\[.*\]\s*$/s.test(String(s ?? ''));
// Text output; values still in [brackets] get a dashed outline so editors can spot them.
const t = (s, tag = 'span', cls = '') => {
  const c = [cls, isPh(s) ? 'placeholder' : ''].filter(Boolean).join(' ');
  return `<${tag}${c ? ` class="${c}"` : ''}>${esc(s)}</${tag}>`;
};
const img = (src, alt, label) => src
  ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
  : `<div class="img-ph">${esc(label)}</div>`;
const fmtDate = (d) => isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const hex = (v, fallback) => (/^#[0-9a-f]{3,8}$/i.test(v || '') ? v : fallback);
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ICONS = {
  education: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  health: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5.5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  agriculture: '<path d="M12 22V12"/><path d="M5 12c0-4 3-7 7-7 0 4-3 7-7 7Z"/><path d="M19 9c0 3-2 5-7 5 0-3 2-5 7-5Z"/>',
  jobs: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  infrastructure: '<path d="M4 19h16M6 19V9l6-5 6 5v10"/><path d="M10 19v-5h4v5"/>',
  finance: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v12"/>',
  water: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  security: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  community: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5"/>',
  power: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
};
const icon = (name) => `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.community}</svg>`;

const SOCIALS = { facebook: ['Facebook', 'f'], x: ['X / Twitter', '𝕏'], instagram: ['Instagram', '◎'], youtube: ['YouTube', '▶'], tiktok: ['TikTok', '♪'] };

// ---------- layout ----------
const layout = ({ title, description, body, image, pathName = '/' }) => {
  const primary = hex(site.colors?.primary, '#0b5d3b');
  const accent = hex(site.colors?.accent, '#c8a13a');
  const url = (site.siteUrl || '').replace(/\/$/, '') + pathName;
  const socials = Object.entries(SOCIALS)
    .filter(([k]) => site.socials?.[k])
    .map(([k, [label, glyph]]) => `<a href="${esc(site.socials[k])}" aria-label="${label}" target="_blank" rel="noopener">${glyph}</a>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${primary}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>:root{--brand:${primary};--accent:${accent}}</style>
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<header>
  <div class="wrap nav">
    <a href="/" class="logo"><span class="logo-mark">${esc(site.shortName)}</span><span>${esc(site.name)}<small>${esc(site.constituency)}</small></span></a>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
    <ul class="nav-links">
      <li><a href="/#about">About</a></li>
      <li><a href="/#agenda">Agenda</a></li>
      <li><a href="/#journey">Journey</a></li>
      <li><a href="/#projects">Projects</a></li>
      <li><a href="/news">News</a></li>
      <li><a href="/#involve" class="btn btn-green">Get Involved</a></li>
    </ul>
  </div>
</header>
<main>
${body}
</main>
<footer>
  <div class="wrap">
    <div class="foot">
      <a href="/" class="logo"><span class="logo-mark">${esc(site.shortName)}</span><span>${esc(site.name)}<small>${esc(`${site.hero?.headline ?? ''} ${site.hero?.highlight ?? ''}`.trim())}</small></span></a>
      ${socials ? `<div class="socials">${socials}</div>` : ''}
    </div>
    <div class="copy">© ${new Date().getFullYear()} Office of ${esc(site.name)}. All rights reserved.</div>
  </div>
</footer>
<script>
  const links = document.querySelector('.nav-links'), mb = document.querySelector('.menu-btn');
  mb.addEventListener('click', () => mb.setAttribute('aria-expanded', links.classList.toggle('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
</script>
</body>
</html>`;
};

// ---------- home page ----------
const postCard = (p) => `
        <article class="post">
          <time datetime="${isNaN(p.date) ? '' : p.date.toISOString()}">${fmtDate(p.date)}</time>
          <h3><a href="/news/${p.slug}">${t(p.title)}</a></h3>
          ${p.summary ? t(p.summary, 'p') : ''}
          <a class="more" href="/news/${p.slug}">Read more →</a>
        </article>`;

const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];

const home = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="tag">${esc(site.hero.badge)}</span>
        <h1>${esc(site.hero.headline)} <span>${esc(site.hero.highlight)}</span></h1>
        ${t(site.hero.intro, 'p')}
        <div class="hero-ctas">
          <a href="#projects" class="btn btn-gold">See the Impact</a>
          <a href="#involve" class="btn btn-ghost">Join the Movement</a>
        </div>
      </div>
      <div class="hero-photo">${img(site.hero.image, site.name, 'Official portrait — upload in Admin → Site Settings')}</div>
    </div>
  </section>

  <div class="wrap stats-wrap">
    <div class="stats">
      ${site.stats.map((s) => `<div class="stat">${t(s.value, 'b')}<span>${esc(s.label)}</span></div>`).join('\n      ')}
    </div>
  </div>

  <section id="about" style="padding-top:40px">
    <div class="wrap about-grid">
      <div class="about-photo">${img(about.image, site.name, 'Photo: SMA with constituents — upload in Admin → About')}</div>
      <div>
        <span class="eyebrow">About ${esc(site.shortName)}</span>
        <h2 class="h2">${esc(about.heading)}</h2>
        <div class="prose">${marked.parse(about.body || '')}</div>
        <div class="facts">
          ${about.facts.map((f) => `<div class="fact"><small>${esc(f.label)}</small>${t(f.value, 'strong')}</div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>

  <section id="agenda" class="alt">
    <div class="wrap">
      <span class="eyebrow">The Agenda</span>
      <h2 class="h2">${esc(agenda.heading)}</h2>
      ${agenda.intro ? t(agenda.intro, 'p', 'lead') : ''}
      <div class="cards">
        ${agenda.items.map((a) => `<div class="card"><div class="icon">${icon(a.icon)}</div><h3>${esc(a.title)}</h3>${t(a.text, 'p')}</div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="journey" class="alt" style="padding-top:0">
    <div class="wrap">
      <span class="eyebrow">The Journey</span>
      <h2 class="h2">Milestones of service</h2>
      <div class="timeline">
        ${about.timeline.map((m) => `<div class="t-item">${t(m.year, 'div', 't-year')}<h3>${esc(m.title)}</h3>${t(m.text, 'p')}</div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="projects">
    <div class="wrap">
      <span class="eyebrow">Impact</span>
      <h2 class="h2">Constituency projects</h2>
      <p class="lead">Delivering tangible results across Bida, Gbako and Katcha.</p>
      ${categories.length > 1 ? `<div class="filter">
        <button class="chip active" data-f="all">All</button>
        ${categories.map((c) => `<button class="chip" data-f="${slugify(c)}">${esc(c)}</button>`).join('\n        ')}
      </div>` : ''}
      <div class="projects">
        ${projects.map((p) => `<article class="project" data-c="${slugify(p.category || '')}">
          <div class="thumb">${img(p.image, p.title, 'Project photo')}</div>
          <div class="body"><span class="cat">${esc(p.category)}</span><h3>${t(p.title)}</h3>
            <p class="meta">${[p.location, p.year].filter(Boolean).map((v) => t(v)).join(' · ')}</p>
            ${t(p.summary, 'p')}</div>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  ${site.quote ? `<section class="quote">
    <div class="wrap">
      ${isPh(site.quote) ? t(site.quote, 'blockquote') : `<blockquote>“${esc(site.quote)}”</blockquote>`}
      <cite>— ${esc(site.name)}</cite>
    </div>
  </section>` : ''}

  <section id="news">
    <div class="wrap">
      <span class="eyebrow">Newsroom</span>
      <h2 class="h2">Latest updates</h2>
      <div class="news">${posts.slice(0, 3).map(postCard).join('')}
      </div>
      ${posts.length > 3 ? '<div class="section-cta"><a class="btn btn-green" href="/news">All news</a></div>' : ''}
    </div>
  </section>

  <section id="involve" class="alt">
    <div class="wrap involve">
      <div>
        <span class="eyebrow">Get Involved</span>
        <h2 class="h2">Your voice matters.</h2>
        <p class="lead">Volunteer, request support, invite ${esc(site.shortName)} to an event, or simply share what your community needs.</p>
        <ul class="contact-list">
          <li><span class="icon">📍</span><div><strong>Constituency Office</strong><br>${t(site.contact.address)}</div></li>
          <li><span class="icon">✉️</span><div><strong>Email</strong><br>${isPh(site.contact.email) ? t(site.contact.email) : `<a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>`}</div></li>
          <li><span class="icon">📞</span><div><strong>Phone / WhatsApp</strong><br>${isPh(site.contact.phone) ? t(site.contact.phone) : `<a href="tel:${esc(site.contact.phone.replace(/\s/g, ''))}">${esc(site.contact.phone)}</a>`}</div></li>
        </ul>
      </div>
      <form id="contact" ${site.formEndpoint ? `action="${esc(site.formEndpoint)}" method="POST"` : ''}>
        <div class="row">
          <label>Full name<input required name="name" autocomplete="name"></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
        </div>
        <label>Email<input required name="email" type="email" autocomplete="email"></label>
        <div class="row">
          <label>Ward / Community<input name="ward"></label>
          <label>I want to
            <select name="topic"><option>Volunteer</option><option>Request support</option><option>Invite to event</option><option>Share feedback</option><option>Media enquiry</option></select>
          </label>
        </div>
        <label>Message<textarea name="message"></textarea></label>
        <button class="btn btn-green" type="submit">Send Message</button>
        <p class="form-msg">Thank you! The office will be in touch.</p>
      </form>
    </div>
  </section>

<script>
  document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.f;
    document.querySelectorAll('.project').forEach(p => p.style.display = (f === 'all' || p.dataset.c === f) ? '' : 'none');
  }));
  const form = document.getElementById('contact');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = form.querySelector('.form-msg');
    if (form.action && form.getAttribute('action')) {
      try {
        const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error();
      } catch { msg.textContent = 'Sorry, something went wrong. Please email or call the office.'; }
    }
    msg.style.display = 'block';
    form.reset();
  });
</script>`;

// ---------- write output ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/styles.css'), path.join(OUT, 'styles.css'));

const write = (rel, html) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

const absImg = (src) => (src && site.siteUrl && src.startsWith('/') ? site.siteUrl.replace(/\/$/, '') + src : src);

write('index.html', layout({
  title: `${site.name} | ${site.constituency}`,
  description: site.seoDescription,
  image: absImg(site.hero.image),
  body: home,
}));

write('news/index.html', layout({
  title: `News | ${site.name}`,
  description: `Latest news and press releases from the office of ${site.name}.`,
  pathName: '/news',
  body: `<div class="page-head"><div class="wrap"><span class="eyebrow">Newsroom</span><h1>News &amp; press releases</h1></div></div>
  <section><div class="wrap"><div class="news" style="margin-top:0">${posts.map(postCard).join('')}</div></div></section>`,
}));

for (const p of posts) {
  write(`news/${p.slug}.html`, layout({
    title: `${p.title} | ${site.name}`,
    description: p.summary || site.seoDescription,
    image: absImg(p.image),
    pathName: `/news/${p.slug}`,
    body: `<article class="article">
    <a class="back" href="/news">← All news</a>
    <h1>${t(p.title)}</h1>
    <time>${fmtDate(p.date)}</time>
    ${p.image ? `<div class="cover"><img src="${esc(p.image)}" alt=""></div>` : ''}
    <div class="prose">${p.html}</div>
  </article>`,
  }));
}

const primary = hex(site.colors?.primary, '#0b5d3b');
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${primary}"/><text x="32" y="41" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${esc(site.shortName)}</text></svg>`);

if (site.siteUrl) {
  const base = site.siteUrl.replace(/\/$/, '');
  const urls = ['/', '/news', ...posts.map((p) => `/news/${p.slug}`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nDisallow: /admin/\nSitemap: ${base}/sitemap.xml\n`);
}

console.log(`Built ${2 + posts.length} pages and ${projects.length} projects into dist/`);
