import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePropertyStore } from '@/store/propertyStore'
import { PropertyCard } from '@/components/PropertyCard'
import type { PropertyType, PropertyStatus } from '@/types'
import './Listings.css'

const TYPES: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condo' },
  { value: 'house', label: 'House' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
]

const STATUSES: { value: PropertyStatus | ''; label: string }[] = [
  { value: '', label: 'For Sale & Rent' },
  { value: 'for_sale', label: 'For Sale' },
  { value: 'for_rent', label: 'For Rent' },
]

const BEDS = ['', '1', '2', '3', '4', '5']

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { fetchProperties, loading, filters, setFilters, getFiltered } = usePropertyStore()

  useEffect(() => {
    fetchProperties()
    // Sync URL params to filters
    const search = searchParams.get('search') ?? ''
    const type = (searchParams.get('type') ?? '') as PropertyType | ''
    if (search || type) setFilters({ search, type })
  }, []) // eslint-disable-line

  const results = getFiltered()

  const updateFilter = (key: string, value: string) => {
    setFilters({ [key]: value })
    if (key === 'search') {
      setSearchParams(value ? { search: value } : {})
    }
  }

  return (
    <div className="listings-page">
      <div className="listings-hero">
        <div className="container">
          <h1 className="listings-hero__title">Property Listings</h1>
          <p className="listings-hero__sub">{results.length} properties found</p>
        </div>
      </div>

      <div className="container">
        <div className="listings-layout">
          {/* Sidebar filters */}
          <aside className="filters-sidebar">
            <div className="filters-panel">
              <h3 className="filters-panel__title">Filters</h3>

              <div className="filter-group">
                <label>Search</label>
                <input
                  className="filter-input"
                  placeholder="Location, title…"
                  value={filters.search}
                  onChange={e => updateFilter('search', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Type</label>
                <select className="filter-select" value={filters.type} onChange={e => updateFilter('type', e.target.value)}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select className="filter-select" value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Min Price (฿)</label>
                <input
                  className="filter-input"
                  type="number"
                  placeholder="e.g. 1000000"
                  value={filters.minPrice}
                  onChange={e => updateFilter('minPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Max Price (฿)</label>
                <input
                  className="filter-input"
                  type="number"
                  placeholder="e.g. 10000000"
                  value={filters.maxPrice}
                  onChange={e => updateFilter('maxPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Min Bedrooms</label>
                <div className="bed-pills">
                  {BEDS.map(b => (
                    <button
                      key={b}
                      className={`bed-pill ${filters.bedrooms === b ? 'bed-pill--active' : ''}`}
                      onClick={() => updateFilter('bedrooms', b)}
                    >
                      {b === '' ? 'Any' : `${b}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>City</label>
                <input
                  className="filter-input"
                  placeholder="Koh Tao, Koh Samui…"
                  value={filters.city}
                  onChange={e => updateFilter('city', e.target.value)}
                />
              </div>

              <button
                className="filter-reset"
                onClick={() => setFilters({ search: '', type: '', status: '', minPrice: '', maxPrice: '', bedrooms: '', city: '' })}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Results grid */}
          <main className="listings-results">
            {loading ? (
              <div className="listings-grid">
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" style={{ height: 360 }} />)}
              </div>
            ) : results.length === 0 ? (
              <div className="listings-empty">
                <span>🔍</span>
                <h3>No properties found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="listings-grid">
                {results.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
