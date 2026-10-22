# Hon. Saidu Musa Abdullahi — Official Website

A fast static website with a built-in admin panel at **`/admin`**, hosted on Vercel.

- **Site content** is stored in `content/`, in JSON and Markdown files.
- **Admin panel:** [Decap CMS](https://decapcms.org) runs at `/admin`. Admins sign in with GitHub and edit text, photos, colours, projects and news in a form. Each save is committed to GitHub, and Vercel redeploys the site automatically in about a minute.
- **Admin login:** two small serverless functions in `api/` handle the GitHub sign-in, so no third-party CMS account is needed.

```
content/          ← everything editable (site settings, about, agenda, projects/, news/)
static/           ← copied as-is: admin panel, uploaded images (static/images)
src/styles.css    ← site styles (brand colours come from content/site.json)
build.mjs         ← generates dist/ from content/
api/              ← GitHub login for the admin panel
```

## One-time setup (about 15 minutes)

### 1. GitHub repository
The code is hosted at [abdulrahman5/project-sma](https://github.com/abdulrahman5/project-sma), and `static/admin/config.yml` already points to it. If you move the repository, update `repo:` in that file.

### 2. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import the repository. Vercel reads `vercel.json`, so keep the default settings and click **Deploy**.
2. Note the site address, for example `https://sma-website.vercel.app`. To add a custom domain such as `saidumusa.com`, go to **Settings → Domains**.

### 3. Enable admin login (GitHub OAuth app)
1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - **Homepage URL:** `https://YOUR-DOMAIN`
   - **Authorization callback URL:** `https://YOUR-DOMAIN/api/callback`
2. Copy the **Client ID** and generate a **Client Secret**.
3. In Vercel, go to **Project → Settings → Environment Variables** and add:
   - `GITHUB_CLIENT_ID` = the client ID
   - `GITHUB_CLIENT_SECRET` = the client secret
4. Redeploy (**Deployments → ⋯ → Redeploy**).

> An OAuth app has only one callback URL. If you later move to a custom domain, update the callback URL to match.

### 4. Add admins
Each admin needs a free GitHub account. Add them to the repository under **Settings → Collaborators** with **Write** access. They can then go to `https://YOUR-DOMAIN/admin` and click **Login with GitHub**.

## Using the admin panel

| Section | What you can change |
|---|---|
| **Site Settings** | Name, party, brand colours, top banner text and portrait, key numbers, quote, contact details, social links, contact-form endpoint |
| **About & Timeline** | Biography, photo, quick facts, milestones |
| **Agenda / Priorities** | The priority cards and their icons |
| **Projects** | Add, edit or remove constituency projects, with photos and categories |
| **News & Press** | Write press releases; tick **Draft** to hide a post |

Text written in `[square brackets]` is placeholder text. It appears on the site with a gold dashed outline until it is replaced.

**Contact form:** create a free form at [formspree.io](https://formspree.io), then paste its URL into **Site Settings → Contact form endpoint**. Messages will then arrive by email.

## Local development
```bash
npm install
npm run dev     # builds and serves on http://localhost:3000
```
