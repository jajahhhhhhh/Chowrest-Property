import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePropertyStore } from '@/store/propertyStore'
import { PropertyCard } from '@/components/PropertyCard'
import './Home.css'

const STATS = [
  { num: '340+', label: 'Active Listings' },
  { num: '12', label: 'Expert Agents' },
  { num: '฿2.4B', label: 'Properties Sold' },
  { num: '98%', label: 'Client Satisfaction' },
]

const PROPERTY_TYPES = [
  { type: 'villa', label: 'Villas', icon: '🏖️' },
  { type: 'condo', label: 'Condos', icon: '🏙️' },
  { type: 'house', label: 'Houses', icon: '🏡' },
  { type: 'land', label: 'Land', icon: '🌿' },
  { type: 'commercial', label: 'Commercial', icon: '🏢' },
]

export default function Home() {
  const { featured, fetchFeatured, loading } = usePropertyStore()

  useEffect(() => { fetchFeatured() }, [fetchFeatured])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <p className="hero__eyebrow">Koh Samui · Surat Thani</p>
          <h1 className="hero__title">
            Find Your<br />
            <span className="hero__title--accent">Perfect</span><br />
            Property
          </h1>
          <p className="hero__sub">
            Premium real estate in Thailand's most beautiful islands.<br />
            Villas, condos, houses and land — expertly curated.
          </p>
          <div className="hero__actions">
            <Link to="/listings" className="btn btn--primary">Browse Listings</Link>
            <Link to="/auth" className="btn btn--ghost">List Your Property</Link>
          </div>
        </div>
        <div className="hero__scroll">scroll ↓</div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            {STATS.map(s => (
              <div key={s.label} className="stats-bar__item">
                <strong>{s.num}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search quick bar */}
      <section className="quick-search">
        <div className="container">
          <div className="quick-search__bar">
            <input
              className="quick-search__input"
              placeholder="Search by location, property name…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value
                  window.location.href = `/listings?search=${encodeURIComponent(val)}`
                }
              }}
            />
            <Link to="/listings" className="quick-search__btn">Search</Link>
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="types-section">
        <div className="container">
          <h2 className="section-title">Browse by Type</h2>
          <div className="types-grid">
            {PROPERTY_TYPES.map(pt => (
              <Link
                key={pt.type}
                to={`/listings?type=${pt.type}`}
                className="type-card"
              >
                <span className="type-card__icon">{pt.icon}</span>
                <span className="type-card__label">{pt.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Properties</h2>
            <Link to="/listings" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="featured-grid">
              {featured.map(p => (
                <PropertyCard key={p.id} property={p} featured />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__inner">
            <div>
              <h2>Are you an Agent?</h2>
              <p>List your properties, manage leads, and close deals — all in one platform.</p>
            </div>
            <Link to="/auth?role=agent" className="btn btn--primary">Join as Agent</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="footer__brand">
                <span className="footer__name">ChowtoRest</span>
              </div>
              <p className="footer__tagline">Premium real estate in paradise.</p>
            </div>
            <div className="footer__links">
              <Link to="/listings">Listings</Link>
              <Link to="/auth">Sign In</Link>
              <a href="mailto:ch_company@howtoniksen.com">Contact</a>
            </div>
          </div>
          <p className="footer__copy">© 2026 ChowtoRest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
