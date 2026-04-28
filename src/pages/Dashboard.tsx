import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usePropertyStore } from '@/store/propertyStore'
import { formatPrice, statusLabel, typeLabel, timeAgo } from '@/lib/utils'
import type { PropertyFormData, PropertyType, PropertyStatus } from '@/types'
import './Dashboard.css'

const EMPTY_FORM: PropertyFormData = {
  title: '', description: '', type: 'condo', status: 'for_sale',
  price: '', bedrooms: '', bathrooms: '', area_sqm: '',
  address: '', city: '', province: '', images: [], amenities: [],
}

type Tab = 'listings' | 'add'

export default function Dashboard() {
  const { user, profile, initialized } = useAuthStore()
  const { properties, fetchByAgent, createProperty, deleteProperty, loading } = usePropertyStore()
  const [tab, setTab] = useState<Tab>('listings')
  const [form, setForm] = useState<PropertyFormData>(EMPTY_FORM)
  const [imageUrl, setImageUrl] = useState('')
  const [amenityInput, setAmenityInput] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) fetchByAgent(user.id)
  }, [user, fetchByAgent])

  if (!initialized) return <div className="dash-loading">Loading…</div>
  if (!user || profile?.role !== 'agent') return <Navigate to="/auth" replace />

  const activeCount = properties.filter(p => ['for_sale','for_rent'].includes(p.status)).length
  const soldCount   = properties.filter(p => ['sold','rented'].includes(p.status)).length

  const handleSubmit = async () => {
    if (!form.title || !form.price) { setSubmitError('Title and price are required.'); return }
    setSubmitting(true)
    setSubmitError('')
    const err = await createProperty(form, user.id)
    if (err) { setSubmitError(err) }
    else {
      setSuccess(true)
      setForm(EMPTY_FORM)
      setTimeout(() => { setSuccess(false); setTab('listings') }, 2000)
    }
    setSubmitting(false)
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }))
      setImageUrl('')
    }
  }
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }))
      setAmenityInput('')
    }
  }
  const removeAmenity = (a: string) => setForm(f => ({ ...f, amenities: f.amenities.filter(x => x !== a) }))

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__header-inner">
            <div>
              <p className="dash-eyebrow">Agent Dashboard</p>
              <h1 className="dash-title">Welcome, {profile?.full_name ?? 'Agent'}</h1>
            </div>
            <div className="dash-stats">
              <div className="dash-stat"><strong>{properties.length}</strong><span>Total</span></div>
              <div className="dash-stat"><strong>{activeCount}</strong><span>Active</span></div>
              <div className="dash-stat"><strong>{soldCount}</strong><span>Sold/Rented</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dash-tabs">
          <button className={`dash-tab ${tab === 'listings' ? 'dash-tab--active' : ''}`} onClick={() => setTab('listings')}>
            My Listings ({properties.length})
          </button>
          <button className={`dash-tab ${tab === 'add' ? 'dash-tab--active' : ''}`} onClick={() => setTab('add')}>
            + Add Property
          </button>
        </div>

        {/* ── Listings Tab ── */}
        {tab === 'listings' && (
          <div className="dash-listings">
            {loading ? (
              <div className="dash-empty">Loading properties…</div>
            ) : properties.length === 0 ? (
              <div className="dash-empty">
                <p>No listings yet.</p>
                <button className="btn btn--primary" onClick={() => setTab('add')}>Add Your First Property</button>
              </div>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="dash-prop-cell">
                            {p.images[0] && <img src={p.images[0]} alt="" className="dash-prop-thumb" />}
                            <div>
                              <div className="dash-prop-name">{p.title}</div>
                              <div className="dash-prop-loc">{p.city}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="dash-badge">{typeLabel(p.type)}</span></td>
                        <td><span className={`dash-badge dash-badge--${p.status}`}>{statusLabel(p.status)}</span></td>
                        <td className="dash-price">{formatPrice(p.price, p.status)}</td>
                        <td className="dash-date">{timeAgo(p.created_at)}</td>
                        <td>
                          <div className="dash-actions">
                            <Link to={`/listings/${p.id}`} className="dash-action-btn">View</Link>
                            <button
                              className="dash-action-btn dash-action-btn--danger"
                              onClick={async () => {
                                if (confirm('Delete this property?')) await deleteProperty(p.id)
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Add Property Tab ── */}
        {tab === 'add' && (
          <div className="add-property-form">
            {success ? (
              <div className="add-success">
                <span>🎉</span>
                <h3>Property added successfully!</h3>
                <p>Redirecting to your listings…</p>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <div className="form-field form-field--full">
                    <label>Title *</label>
                    <input placeholder="e.g. Beachfront Villa Koh Tao" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="form-field form-field--full">
                    <label>Description</label>
                    <textarea rows={4} placeholder="Describe the property…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Property Type *</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PropertyType }))}>
                      {(['house','condo','villa','land','commercial'] as PropertyType[]).map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Status *</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PropertyStatus }))}>
                      {(['for_sale','for_rent','off_market'] as PropertyStatus[]).map(s => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Price (฿) *</label>
                    <input type="number" placeholder="e.g. 5000000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Area (m²)</label>
                    <input type="number" placeholder="e.g. 120" value={form.area_sqm} onChange={e => setForm(f => ({ ...f, area_sqm: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Bedrooms</label>
                    <input type="number" placeholder="e.g. 3" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Bathrooms</label>
                    <input type="number" placeholder="e.g. 2" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>City</label>
                    <input placeholder="e.g. Koh Samui" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Province</label>
                    <input placeholder="e.g. Surat Thani" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} />
                  </div>
                  <div className="form-field form-field--full">
                    <label>Address</label>
                    <input placeholder="Street address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>

                  {/* Images */}
                  <div className="form-field form-field--full">
                    <label>Image URLs</label>
                    <div className="url-adder">
                      <input placeholder="https://…" value={imageUrl} onChange={e => setImageUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImage()} />
                      <button type="button" onClick={addImage}>Add</button>
                    </div>
                    <div className="added-images">
                      {form.images.map((img, i) => (
                        <div key={i} className="added-image">
                          <img src={img} alt="" />
                          <button onClick={() => removeImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="form-field form-field--full">
                    <label>Amenities</label>
                    <div className="url-adder">
                      <input placeholder="e.g. Pool, Sea View, Parking" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAmenity()} />
                      <button type="button" onClick={addAmenity}>Add</button>
                    </div>
                    <div className="amenity-tags">
                      {form.amenities.map(a => (
                        <span key={a} className="amenity-tag">{a} <button onClick={() => removeAmenity(a)}>×</button></span>
                      ))}
                    </div>
                  </div>
                </div>

                {submitError && <div className="auth-error" style={{ marginBottom: 16 }}>{submitError}</div>}

                <button className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Publish Property'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
