import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePropertyStore } from '@/store/propertyStore'
import { supabase } from '@/lib/supabase'
import { formatPrice, statusLabel, typeLabel } from '@/lib/utils'
import './PropertyDetail.css'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const { current, fetchById, loading } = usePropertyStore()
  const [activeImg, setActiveImg] = useState(0)
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryEmail, setInquiryEmail] = useState('')
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (id) fetchById(id)
    setActiveImg(0)
  }, [id, fetchById])

  const submitInquiry = async () => {
    if (!inquiryName || !inquiryEmail || !current) return
    setSending(true)
    try {
      await supabase.from('leads').insert({
        property_id: current.id,
        agent_id: current.agent_id,
        buyer_name: inquiryName,
        buyer_email: inquiryEmail,
        buyer_phone: inquiryPhone,
        message: inquiryMsg,
      })
    } catch { /* demo mode — no-op */ }
    setSent(true)
    setSending(false)
  }

  if (loading) return (
    <div className="detail-loading">
      <div className="detail-skeleton" />
    </div>
  )

  if (!current) return (
    <div className="detail-notfound container">
      <h2>Property not found</h2>
      <Link to="/listings" className="btn btn--primary">Back to Listings</Link>
    </div>
  )

  return (
    <div className="detail-page">
      {/* Gallery */}
      <div className="detail-gallery">
        <img
          src={current.images[activeImg] ?? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'}
          alt={current.title}
          className="detail-gallery__main"
        />
        {current.images.length > 1 && (
          <div className="detail-gallery__thumbs">
            {current.images.map((img, i) => (
              <button
                key={i}
                className={`detail-gallery__thumb ${i === activeImg ? 'detail-gallery__thumb--active' : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={img} alt={`View ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container">
        <div className="detail-layout">
          {/* Main info */}
          <div className="detail-main">
            <div className="detail-badges">
              <span className={`prop-card__badge prop-card__badge--${current.status}`}>{statusLabel(current.status)}</span>
              <span className="prop-card__badge prop-card__badge--type">{typeLabel(current.type)}</span>
            </div>

            <h1 className="detail-title">{current.title}</h1>

            <p className="detail-location">
              📍 {[current.address, current.city, current.province, current.country].filter(Boolean).join(', ')}
            </p>

            <div className="detail-price">{formatPrice(current.price, current.status)}</div>

            {/* Specs */}
            <div className="detail-specs">
              {current.bedrooms != null && (
                <div className="detail-spec">
                  <span className="detail-spec__icon">🛏</span>
                  <strong>{current.bedrooms}</strong>
                  <span>Bedrooms</span>
                </div>
              )}
              {current.bathrooms != null && (
                <div className="detail-spec">
                  <span className="detail-spec__icon">🚿</span>
                  <strong>{current.bathrooms}</strong>
                  <span>Bathrooms</span>
                </div>
              )}
              {current.area_sqm != null && (
                <div className="detail-spec">
                  <span className="detail-spec__icon">📐</span>
                  <strong>{current.area_sqm.toLocaleString()}</strong>
                  <span>m²</span>
                </div>
              )}
            </div>

            {/* Description */}
            {current.description && (
              <div className="detail-section">
                <h2 className="detail-section__title">About this property</h2>
                <p className="detail-description">{current.description}</p>
              </div>
            )}

            {/* Amenities */}
            {current.amenities.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section__title">Amenities</h2>
                <div className="detail-amenities">
                  {current.amenities.map(a => (
                    <span key={a} className="detail-amenity">✓ {a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inquiry form */}
          <aside className="detail-sidebar">
            <div className="inquiry-card">
              <h3 className="inquiry-card__title">Enquire About This Property</h3>
              {sent ? (
                <div className="inquiry-success">
                  <span>✓</span>
                  <p>Your enquiry has been sent! An agent will contact you shortly.</p>
                </div>
              ) : (
                <div className="inquiry-form">
                  <input className="inquiry-input" placeholder="Your name *" value={inquiryName} onChange={e => setInquiryName(e.target.value)} />
                  <input className="inquiry-input" placeholder="Email address *" type="email" value={inquiryEmail} onChange={e => setInquiryEmail(e.target.value)} />
                  <input className="inquiry-input" placeholder="Phone number" value={inquiryPhone} onChange={e => setInquiryPhone(e.target.value)} />
                  <textarea
                    className="inquiry-textarea"
                    placeholder={`I'm interested in ${current.title}…`}
                    rows={4}
                    value={inquiryMsg}
                    onChange={e => setInquiryMsg(e.target.value)}
                  />
                  <button
                    className="btn btn--primary inquiry-submit"
                    onClick={submitInquiry}
                    disabled={sending || !inquiryName || !inquiryEmail}
                  >
                    {sending ? 'Sending…' : 'Send Enquiry'}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
