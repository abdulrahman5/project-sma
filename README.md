# Hon. Saidu Musa Abdullahi — Official Website

The public website and its admin panel, in one Next.js app on Vercel.

| Address | What it is |
|---|---|
| `yourdomain.com` | Public website (home, news, contact form) |
| `yourdomain.com/admin` | Admin panel. Admins log in with their own email and password. |

```
             yourdomain.com  ──►  Vercel (Next.js + Payload CMS)
                                       │                 │
                               Neon Postgres       Vercel Blob
                        (content, admins, inbox)    (photos)
                                       │
                                    Resend (password-reset emails, contact-form alerts)
```

## What admins can do

| Admin section | Contents |
|---|---|
| **Website → Site settings** | Name, party, **brand colours**, top banner and portrait, key numbers, quote, contact details, social links, link-preview image |
| **Website → About & timeline** | Biography, photo, quick facts, milestones |
| **Website → Agenda / priorities** | Priority cards and icons |
| **Website → Projects** | Constituency projects with photos and categories |
| **Website → News & press** | Press releases with cover photos. Can be saved as drafts. |
| **Website → Photo library** | All uploaded photos, resized automatically |
| **Inbox** | Contact-form messages. Mark them New / In progress / Handled, add notes, or download them all as CSV. |
| **Administration → Admin users** | Add or remove admins (Super Admins only) |

**Roles**
- **Super Admin:** everything, including managing admin users. The first account you create is automatically a Super Admin.
- **Editor:** all content, settings and the Inbox.
- **Contributor:** writes drafts of news and projects but cannot publish them, delete anything, or see the Inbox.

When you click **Save** or **Publish**, the change appears on the live site immediately. Text written in `[square brackets]` is starter placeholder text. It shows on the site with a gold dashed outline until someone replaces it.

**Security built in**
- Passwords must be at least 10 characters.
- An account locks for 15 minutes after 5 failed logins.
- Sessions expire after 8 hours.
- Admins can't change their own role.
- Only website visitors can create messages, through the form. The API cannot be used to create them.
- Spam traps on the contact form.
- No SVG uploads.
- CSV exports are protected against spreadsheet formula injection.

---

## Deploying (one-time setup)

You need free accounts on **Vercel**, **Neon** and **Resend**. The code is in [abdulrahman5/project-sma](https://github.com/abdulrahman5/project-sma).

### 1. Create the Vercel project
1. Go to [vercel.com/new](https://vercel.com/new) and import `abdulrahman5/project-sma`. Vercel detects Next.js automatically.
2. **Don't deploy yet.** First add the database and environment variables (steps 2–4). If the first deploy fails because they're missing, that's fine: just redeploy after adding them.

### 2. Database (Neon)
1. In the Vercel project, go to **Storage → Create Database → Neon (Postgres)**, choose the region closest to Nigeria (e.g. Frankfurt), and connect it to the project.
2. Vercel adds `DATABASE_URL` for you. If you created the database directly on neon.tech instead, copy its **pooled** connection string into a `DATABASE_URL` variable.

### 3. Photo storage (Vercel Blob)
In the Vercel project, go to **Storage → Create → Blob** and connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.

### 4. Environment variables
Go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `PAYLOAD_SECRET` | A long random string, e.g. the output of `openssl rand -hex 32`, or 64 random letters and numbers. Keep it secret and never change it. |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) → API Keys |
| `EMAIL_FROM_ADDRESS` | `onboarding@resend.dev` for now. After launch, use e.g. `noreply@yourdomain.com` (see step 7). |
| `EMAIL_FROM_NAME` | `Office of Hon. Saidu Musa Abdullahi` |

### 5. Deploy
Click **Deploy**, or redeploy. The build automatically:
1. creates the database tables, and
2. on the very first deploy only, loads the starter content: bio, agenda, sample projects and news.

### 6. Create the first admin
Open `https://<your-project>.vercel.app/admin`. You'll see a **Create first user** screen, and that account becomes the Super Admin. Then add other admins under **Administration → Admin users**.

Next, in **Site settings → Contact & social**, set **Send contact-form alerts to** to the office email address.

> Until a custom domain is attached, search engines are told **not** to index the site, so the `.vercel.app` address won't appear in Google.

---

## Before launch

- [ ] **Upgrade to Vercel Pro.** The Hobby plan is for non-commercial use only.
- [ ] **Attach the domain.** In Vercel, go to **Settings → Domains** and add `yourdomain.com` and `www.yourdomain.com`. Then create the DNS records Vercel shows you at your registrar. HTTPS is set up automatically.
  - Nothing else needs to change. The site picks up the new domain on its next deploy, and search indexing switches on, so **redeploy once** after the domain is attached.
- [ ] **Set up email on your domain.** In Resend, go to **Domains → Add domain**, add the DNS records it gives you, then set `EMAIL_FROM_ADDRESS` to e.g. `noreply@yourdomain.com` and redeploy. Until you do, Resend only delivers to the email address you signed up with.
- [ ] Replace all `[placeholder]` text, upload photos, set the brand colours, and delete the sample projects and news.
- [ ] Check every admin account has a strong password, and remove any test accounts.

---

## For developers

```bash
cp .env.example .env        # then fill in DATABASE_URL and PAYLOAD_SECRET
npm install
npm run migrate             # create tables
npm run seed                # load starter content (first time only)
npm run dev                 # http://localhost:3000 and /admin
```

Without `BLOB_READ_WRITE_TOKEN`, uploads are saved to `./media`. Without `RESEND_API_KEY`, emails are printed to the console.

**Changing content fields:** after editing anything in `src/collections` or `src/globals`, run:
```bash
npm run generate:types && npm run generate:importmap
npm run migrate:create <short-name>   # commit the new file in src/migrations
```
Migrations run automatically on every **production** deploy (`npm run build` = migrate → seed-if-empty → `next build`, see `scripts/build.mjs`). Preview deployments of other branches skip the database steps, so they never change the live database.

```
src/
  payload.config.ts        admin/CMS configuration
  access.ts                roles and permissions
  collections/             News, Projects, Media, Messages (Inbox), Users
  globals/                 Site settings, About, Agenda
  migrations/              database schema history
  app/(frontend)/          public website pages and styles
  app/(payload)/           admin panel and API (generated by Payload, don't edit)
  seed/index.ts            starter-content loader  ← seed/data/
```
