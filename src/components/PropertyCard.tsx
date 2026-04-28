import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { formatPrice, statusLabel, typeLabel } from '@/lib/utils'
import './PropertyCard.css'

interface Props {
  property: Property
  featured?: boolean
}

export function PropertyCard({ property: p, featured }: Props) {
  const cover = p.images[0] ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'

  const specs: string[] = []
  if (p.bedrooms  != null) specs.push(`${p.bedrooms} bed`)
  if (p.bathrooms != null) specs.push(`${p.bathrooms} bath`)
  if (p.area_sqm  != null) specs.push(`${p.area_sqm.toLocaleString()} m²`)

  return (
    <Link to={`/listings/${p.id}`} className={`prop-card${featured ? ' prop-card--featured' : ''}`}>
      <div className="prop-card__photo">
        <img src={cover} alt={p.title} loading="lazy" />
        <div className="prop-card__badges">
          <span className={`prop-card__badge prop-card__badge--${p.status}`}>
            {statusLabel(p.status)}
          </span>
          <span className="prop-card__badge prop-card__badge--type">
            {typeLabel(p.type)}
          </span>
        </div>
      </div>

      <div className="prop-card__body">
        <p className="prop-card__location">📍 {p.city}{p.province ? `, ${p.province}` : ''}</p>
        <h3 className="prop-card__title">{p.title}</h3>
        <p className="prop-card__price">{formatPrice(p.price, p.status)}</p>
        {specs.length > 0 && <p className="prop-card__specs">{specs.join(' · ')}</p>}
      </div>
    </Link>
  )
}
