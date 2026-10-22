import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { MESSAGE_TOPICS } from '@/collections/Messages'
import { Icon } from '@/lib/icons'
import { getAbout, getAgenda, getNews, getProjects, getSettings, isPlaceholder, ph } from '@/lib/payload'
import { ContactForm } from './ContactForm'
import { Img } from './Img'
import { PostCard } from './PostCard'
import { ProjectGrid } from './ProjectGrid'

export const dynamic = 'force-static'

export default async function Home() {
  const [s, about, agenda, projects, posts] = await Promise.all([getSettings(), getAbout(), getAgenda(), getProjects(), getNews(4)])
  const categories = [...new Set(projects.map((p) => p.category))]
  const contact = s.contact ?? {}

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            {s.hero?.badge && <span className="tag">{s.hero.badge}</span>}
            <h1>
              {s.hero?.headline} {s.hero?.highlight && <span>{s.hero.highlight}</span>}
            </h1>
            {s.hero?.intro && <p className={ph(s.hero.intro)}>{s.hero.intro}</p>}
            <div className="hero-ctas">
              <a href="#projects" className="btn btn-gold">See the Impact</a>
              <a href="#involve" className="btn btn-ghost">Join the Movement</a>
            </div>
          </div>
          <div className="hero-photo">
            <Img media={s.hero?.image} size="large" alt={s.name} label="Official portrait — upload in Admin → Site settings → Home banner" />
          </div>
        </div>
      </section>

      {!!s.stats?.length && (
        <div className="wrap stats-wrap">
          <div className="stats">
            {s.stats.map((st) => (
              <div className="stat" key={st.id}>
                <b className={ph(st.value)}>{st.value}</b>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section id="about" style={{ paddingTop: 40 }}>
        <div className="wrap about-grid">
          <div className="about-photo">
            <Img media={about.image} size="card" label="Photo: SMA with constituents — upload in Admin → About & timeline" />
          </div>
          <div>
            <span className="eyebrow">About {s.shortName}</span>
            <h2 className="h2">{about.heading}</h2>
            {about.body && <RichText data={about.body} className="prose" />}
            {!!about.facts?.length && (
              <div className="facts">
                {about.facts.map((f) => (
                  <div className="fact" key={f.id}>
                    <small>{f.label}</small>
                    <strong className={ph(f.value)}>{f.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="agenda" className="alt">
        <div className="wrap">
          <span className="eyebrow">The Agenda</span>
          <h2 className="h2">{agenda.heading}</h2>
          {agenda.intro && <p className="lead">{agenda.intro}</p>}
          <div className="cards">
            {agenda.items?.map((a) => (
              <div className="card" key={a.id}>
                <div className="icon"><Icon name={a.icon} /></div>
                <h3>{a.title}</h3>
                <p className={ph(a.text)}>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!about.timeline?.length && (
        <section id="journey" className="alt" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <span className="eyebrow">The Journey</span>
            <h2 className="h2">Milestones of service</h2>
            <div className="timeline">
              {about.timeline.map((m) => (
                <div className="t-item" key={m.id}>
                  <div className={['t-year', ph(m.year)].filter(Boolean).join(' ')}>{m.year}</div>
                  <h3>{m.title}</h3>
                  {m.text && <p className={ph(m.text)}>{m.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="projects">
        <div className="wrap">
          <span className="eyebrow">Impact</span>
          <h2 className="h2">Constituency projects</h2>
          <p className="lead">Delivering tangible results across Bida, Gbako and Katcha.</p>
          <ProjectGrid
            categories={categories}
            cards={projects.map((p) => ({
              category: p.category,
              node: (
                <article className="project" key={p.id}>
                  <div className="thumb"><Img media={p.image} size="card" label="Project photo" /></div>
                  <div className="body">
                    <span className="cat">{p.category}</span>
                    <h3><span className={ph(p.title)}>{p.title}</span></h3>
                    {(p.location || p.year) && (
                      <p className="meta">
                        {[p.location, p.year].filter(Boolean).map((v, i) => (
                          <span key={i}>{i > 0 && ' · '}<span className={ph(v)}>{v}</span></span>
                        ))}
                      </p>
                    )}
                    <p className={ph(p.summary)}>{p.summary}</p>
                  </div>
                </article>
              ),
            }))}
          />
        </div>
      </section>

      {s.quote && (
        <section className="quote">
          <div className="wrap">
            <blockquote className={ph(s.quote)}>{isPlaceholder(s.quote) ? s.quote : `“${s.quote}”`}</blockquote>
            <cite>— {s.name}</cite>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section id="news">
          <div className="wrap">
            <span className="eyebrow">Newsroom</span>
            <h2 className="h2">Latest updates</h2>
            <div className="news">{posts.slice(0, 3).map((p) => <PostCard key={p.id} post={p} />)}</div>
            {posts.length > 3 && (
              <div className="section-cta"><Link className="btn btn-green" href="/news">All news</Link></div>
            )}
          </div>
        </section>
      )}

      <section id="involve" className="alt">
        <div className="wrap involve">
          <div>
            <span className="eyebrow">Get Involved</span>
            <h2 className="h2">Your voice matters.</h2>
            <p className="lead">Volunteer, request support, invite {s.shortName} to an event, or simply share what your community needs.</p>
            <ul className="contact-list">
              {contact.address && (
                <li><span className="icon">📍</span><div><strong>Constituency Office</strong><br /><span className={ph(contact.address)}>{contact.address}</span></div></li>
              )}
              {contact.email && (
                <li><span className="icon">✉️</span><div><strong>Email</strong><br />
                  {isPlaceholder(contact.email) ? <span className="placeholder">{contact.email}</span> : <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                </div></li>
              )}
              {contact.phone && (
                <li><span className="icon">📞</span><div><strong>Phone / WhatsApp</strong><br />
                  {isPlaceholder(contact.phone) ? <span className="placeholder">{contact.phone}</span> : <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>}
                </div></li>
              )}
            </ul>
          </div>
          <ContactForm topics={MESSAGE_TOPICS} />
        </div>
      </section>
    </>
  )
}
