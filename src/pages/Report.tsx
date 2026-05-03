import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { usePropertyStore } from '@/store/propertyStore'
import { formatPrice } from '@/lib/utils'
import type { Property } from '@/types'
import './Report.css'

// ─── Demo financial / booking data (replace with real DB data later) ──────────
const revenueData = [
  { month: 'Jan', revenue: 148000, expenses: 42000, net: 106000 },
  { month: 'Feb', revenue: 186000, expenses: 38000, net: 148000 },
  { month: 'Mar', revenue: 224000, expenses: 51000, net: 173000 },
  { month: 'Apr', revenue: 195000, expenses: 44000, net: 151000 },
  { month: 'May', revenue: 112000, expenses: 36000, net: 76000 },
  { month: 'Jun', revenue: 98000, expenses: 33000, net: 65000 },
]
const occupancyData = [
  { month: 'Jan', rate: 72, adr: 9200, prevRate: 58 },
  { month: 'Feb', rate: 88, adr: 10400, prevRate: 71 },
  { month: 'Mar', rate: 94, adr: 11800, prevRate: 82 },
  { month: 'Apr', rate: 81, adr: 9600, prevRate: 74 },
  { month: 'May', rate: 61, adr: 7300, prevRate: 55 },
  { month: 'Jun', rate: 54, adr: 6800, prevRate: 49 },
]
const expenseBreakdown = [
  { category: 'Staff & Operations', amount: 82000, pct: 36 },
  { category: 'Maintenance & Repairs', amount: 41000, pct: 18 },
  { category: 'Supplies & Restocking', amount: 28000, pct: 12 },
  { category: 'Marketing & OTAs', amount: 34000, pct: 15 },
  { category: 'Utilities', amount: 22000, pct: 10 },
  { category: 'Insurance & Admin', amount: 20000, pct: 9 },
]
const maintenanceLog = [
  { date: '12 Jan', item: 'Pool pump replacement', cost: 4800, status: 'Resolved', days: 1 },
  { date: '28 Jan', item: 'AC unit servicing', cost: 1200, status: 'Resolved', days: 0 },
  { date: '05 Feb', item: 'Outdoor furniture deep clean', cost: 800, status: 'Resolved', days: 1 },
  { date: '19 Feb', item: 'Hot water system inspection', cost: 600, status: 'Resolved', days: 0 },
  { date: '03 Mar', item: 'Garden landscaping — quarterly', cost: 3500, status: 'Resolved', days: 2 },
  { date: '21 Mar', item: 'Roof tile repair (storm damage)', cost: 6200, status: 'Resolved', days: 3 },
]
const kpis = [
  { label: 'Q1 Revenue', value: '฿558,000', sub: '+24% vs Q1 2025', up: true },
  { label: 'Avg Occupancy', value: '84.7%', sub: '+13pts vs Q1 2025', up: true },
  { label: 'Avg Nightly Rate', value: '฿10,467', sub: '+18% vs Q1 2025', up: true },
  { label: 'Net Owner Income', value: '฿427,000', sub: '76.5% net margin', up: true },
]
const TEAL = '#3d7a6a'
const GOLD = '#c9a84c'
const SECTIONS = [
  { id: 'executive', label: 'Executive Summary' },
  { id: 'booking',   label: 'Booking Performance' },
  { id: 'financial', label: 'Financial Report' },
  { id: 'property',  label: 'Property Care' },
  { id: 'guest',     label: 'Guest Experience' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="rpt-section-header">
      <div className="rpt-section-header__row">
        <span className="rpt-section-num">0{number}</span>
        <div className="rpt-section-rule" />
      </div>
      <h2 className="rpt-section-title">{title}</h2>
      {subtitle && <p className="rpt-section-sub">{subtitle}</p>}
    </div>
  )
}

function KPICard({ label, value, sub, up }: { label: string; value: string; sub: string; up: boolean }) {
  return (
    <div className="rpt-kpi">
      <p className="rpt-kpi__label">{label}</p>
      <p className="rpt-kpi__value">{value}</p>
      <p className={`rpt-kpi__sub ${up ? 'rpt-kpi__sub--up' : 'rpt-kpi__sub--down'}`}>
        {up ? '↑' : '↓'} {sub}
      </p>
    </div>
  )
}

const ChartTip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rpt-tooltip">
      <p className="rpt-tooltip__label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name?.toLowerCase().includes('rate') ? `${p.value}%` : `฿${p.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, initialized } = useAuthStore()
  const { current, fetchById, loading } = usePropertyStore()
  const [activeSection, setActiveSection] = useState('executive')

  useEffect(() => {
    if (id) fetchById(id)
  }, [id, fetchById])

  if (!initialized) return <div className="rpt-loading">Loading…</div>
  if (!user || profile?.role !== 'agent') return <Navigate to="/auth" replace />
  if (loading) return <div className="rpt-loading">Loading report…</div>
  if (!current) return <div className="rpt-loading">Property not found.</div>

  const p: Property = current
  const cover = p.images[0] ?? ''
  const period = 'Q1 2026 (Jan – Mar)'

  const handlePrint = () => window.print()

  return (
    <div className="rpt">
      {/* ── Back bar ── */}
      <div className="rpt-topbar no-print">
        <Link to="/dashboard" className="rpt-back">← Back to Dashboard</Link>
        <div className="rpt-topbar__right">
          <span className="rpt-draft-badge">Demo Data</span>
          <button className="rpt-print-btn" onClick={handlePrint}>⬇ Download PDF</button>
        </div>
      </div>

      {/* ── Cover ── */}
      <div className="rpt-cover">
        {cover && <div className="rpt-cover__photo" style={{ backgroundImage: `url(${cover})` }} />}
        <div className="rpt-cover__overlay" />
        <div className="rpt-cover__content">
          <p className="rpt-cover__brand">CHOWTO Property Management</p>
          <h1 className="rpt-cover__title">{p.title}</h1>
          <p className="rpt-cover__type">
            {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
            {p.bedrooms ? ` · ${p.bedrooms} Bed` : ''}
            {p.bathrooms ? ` · ${p.bathrooms} Bath` : ''}
            {p.area_sqm ? ` · ${p.area_sqm.toLocaleString()} m²` : ''}
          </p>
          <p className="rpt-cover__location">📍 {p.city}{p.province ? `, ${p.province}` : ''}</p>
          <div className="rpt-cover__meta">
            <div>
              <p className="rpt-cover__meta-label">Reporting Period</p>
              <p className="rpt-cover__meta-value">{period}</p>
            </div>
            <div>
              <p className="rpt-cover__meta-label">Listed Price</p>
              <p className="rpt-cover__meta-value">{formatPrice(p.price, p.status)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <div className="rpt-nav no-print">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`rpt-nav__btn ${activeSection === s.id ? 'rpt-nav__btn--active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="rpt-body">

        {/* ══ 01 EXECUTIVE SUMMARY ══ */}
        {activeSection === 'executive' && (
          <div>
            <SectionHeader number={1} title="Executive Summary" subtitle="Key performance indicators for the reporting period" />
            <div className="rpt-kpi-grid">
              {kpis.map(k => <KPICard key={k.label} {...k} />)}
            </div>
            <div className="rpt-card rpt-card--narrative">
              <h3 className="rpt-card__title">Management Commentary</h3>
              <p className="rpt-prose">
                Q1 2026 delivered exceptional results for <strong>{p.title}</strong>, with all key metrics exceeding both the prior year and our internal targets. March peak season achieved a record <strong style={{ color: TEAL }}>94% occupancy</strong> driven by strong European repeat bookings and a successful promotional campaign on Booking.com. Revenue grew <strong style={{ color: TEAL }}>24% year-on-year</strong>, while disciplined expense management held operating costs below budget by ฿12,000.
              </p>
              <p className="rpt-prose" style={{ marginTop: 14 }}>
                Storm damage in March was addressed within 3 days with minimal guest disruption. We recommend budgeting ฿25,000 for a preventative roof inspection ahead of the next monsoon season. Overall, <strong>{p.title}</strong> continues to outperform comparable properties in the {p.city} corridor.
              </p>
            </div>
            <div className="rpt-card">
              <h3 className="rpt-card__title">6-Month Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2018" />
                  <XAxis dataKey="month" tick={{ fill: '#6a6860', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6a6860', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8a8678' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={TEAL} fill="url(#gRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke={GOLD} fill="url(#gExp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ 02 BOOKING PERFORMANCE ══ */}
        {activeSection === 'booking' && (
          <div>
            <SectionHeader number={2} title="Booking Performance" subtitle="Occupancy, average daily rate, and channel analysis" />
            <div className="rpt-card">
              <h3 className="rpt-card__title">Occupancy Rate — Current vs Prior Year</h3>
              <p className="rpt-card__sub">Monthly occupancy % with year-on-year comparison</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={occupancyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2018" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#6a6860', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6a6860', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8a8678' }} />
                  <Bar dataKey="rate" name="2026" fill={TEAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prevRate" name="2025" fill="#2e3830" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rpt-card">
              <h3 className="rpt-card__title">Average Daily Rate (ADR)</h3>
              <p className="rpt-card__sub">฿ per night, all channels combined</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2018" />
                  <XAxis dataKey="month" tick={{ fill: '#6a6860', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6a6860', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `฿${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="adr" name="ADR" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rpt-stat-grid">
              {[
                { label: 'Total Bookings', value: '47', sub: 'Q1 2026' },
                { label: 'Avg Stay Length', value: '6.2 nights', sub: 'vs 5.1 prior year' },
                { label: 'Lead Time', value: '38 days', sub: 'Avg advance booking' },
                { label: 'Cancellation Rate', value: '3.2%', sub: 'Industry avg: 8.5%' },
              ].map(s => (
                <div key={s.label} className="rpt-stat">
                  <p className="rpt-stat__label">{s.label}</p>
                  <p className="rpt-stat__value">{s.value}</p>
                  <p className="rpt-stat__sub">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ 03 FINANCIAL REPORT ══ */}
        {activeSection === 'financial' && (
          <div>
            <SectionHeader number={3} title="Financial Report" subtitle="Profit & loss statement and expense analysis" />
            <div className="rpt-card">
              <h3 className="rpt-card__title">P&L Statement — Q1 2026</h3>
              <div className="rpt-table-wrap">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      {['Line Item', 'Jan', 'Feb', 'Mar', 'Q1 Total'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Gross Revenue',       values: [148000, 186000, 224000],  bold: false, color: TEAL },
                      { label: 'Platform Fees (15%)', values: [-22200, -27900, -33600],  bold: false, color: '' },
                      { label: 'Net Revenue',         values: [125800, 158100, 190400],  bold: true,  color: '#a09a8e' },
                      { label: '— Staff & Operations',values: [-18000, -17000, -18500],  bold: false, color: '' },
                      { label: '— Maintenance',       values: [-6000, -8200, -12400],    bold: false, color: '' },
                      { label: '— Supplies',          values: [-9000, -8500, -11000],    bold: false, color: '' },
                      { label: '— Utilities',         values: [-5000, -4300, -5200],     bold: false, color: '' },
                      { label: '— Marketing',         values: [-4000, 0, -8400],         bold: false, color: '' },
                      { label: 'Total Expenses',      values: [-42000, -38000, -55500],  bold: true,  color: GOLD },
                      { label: 'Net Owner Income',    values: [83800, 120100, 134900],   bold: true,  color: TEAL, big: true },
                    ].map((row, i) => {
                      const total = row.values.reduce((a, b) => a + b, 0)
                      const fmtVal = (v: number) => v < 0 ? `(฿${Math.abs(v).toLocaleString()})` : `฿${v.toLocaleString()}`
                      return (
                        <tr key={i} className={row.big ? 'rpt-table__total' : ''}>
                          <td style={{ color: row.bold ? '#f0ece4' : '#8a8678', fontWeight: row.bold ? 600 : 400 }}>{row.label}</td>
                          {row.values.map((v, j) => (
                            <td key={j} style={{ color: row.color || (v < 0 ? '#8a6860' : '#8a8678'), textAlign: 'right', fontWeight: row.bold ? 600 : 400 }}>
                              {fmtVal(v)}
                            </td>
                          ))}
                          <td style={{ color: row.color || (total < 0 ? '#8a6860' : '#a09a8e'), textAlign: 'right', fontWeight: 700, borderLeft: '1px solid #2e3028' }}>
                            {fmtVal(total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rpt-card">
              <h3 className="rpt-card__title">Expense Breakdown</h3>
              <div className="rpt-expense-list">
                {expenseBreakdown.map(e => (
                  <div key={e.category} className="rpt-expense-row">
                    <div className="rpt-expense-row__top">
                      <span>{e.category}</span>
                      <span>฿{e.amount.toLocaleString()} <span className="rpt-dim">({e.pct}%)</span></span>
                    </div>
                    <div className="rpt-expense-bar">
                      <div className="rpt-expense-bar__fill" style={{ width: `${e.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ 04 PROPERTY CARE ══ */}
        {activeSection === 'property' && (
          <div>
            <SectionHeader number={4} title="Property Care Log" subtitle="Maintenance history, resolution times, and upcoming recommendations" />
            <div className="rpt-stat-grid" style={{ marginBottom: 32 }}>
              {[
                { label: 'Issues Logged', value: '6', icon: '🔧' },
                { label: 'Avg Resolution', value: '1.2 days', icon: '⏱' },
                { label: 'Total Spend', value: '฿17,100', icon: '💰' },
                { label: 'Open Issues', value: '0', icon: '✅' },
              ].map(s => (
                <div key={s.label} className="rpt-stat rpt-stat--icon">
                  <span className="rpt-stat__icon">{s.icon}</span>
                  <p className="rpt-stat__value">{s.value}</p>
                  <p className="rpt-stat__label">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="rpt-card">
              <h3 className="rpt-card__title">Maintenance Log</h3>
              <div className="rpt-table-wrap">
                <table className="rpt-table">
                  <thead>
                    <tr>{['Date', 'Issue', 'Cost', 'Status', 'Days'].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {maintenanceLog.map((row, i) => (
                      <tr key={i}>
                        <td className="rpt-dim">{row.date}</td>
                        <td>{row.item}</td>
                        <td style={{ fontWeight: 500 }}>฿{row.cost.toLocaleString()}</td>
                        <td><span className="rpt-badge rpt-badge--green">{row.status}</span></td>
                        <td style={{ color: row.days <= 1 ? TEAL : GOLD }}>{row.days === 0 ? 'Same day' : `${row.days}d`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rpt-card rpt-card--recommend">
              <h3 className="rpt-card__title">💡 Q2 Recommendations</h3>
              {[
                { title: 'Preventative Roof Inspection', budget: '฿8,000', priority: 'High' },
                { title: 'Pool resurfacing (minor cosmetic)', budget: '฿15,000', priority: 'Medium' },
                { title: 'Smart lock installation × 3 doors', budget: '฿12,000', priority: 'Medium' },
                { title: 'Garden irrigation system upgrade', budget: '฿6,500', priority: 'Low' },
              ].map((r, i, arr) => (
                <div key={i} className={`rpt-rec-row ${i < arr.length - 1 ? 'rpt-rec-row--border' : ''}`}>
                  <div>
                    <p className="rpt-rec-row__title">{r.title}</p>
                    <p className="rpt-rec-row__budget">Estimated: {r.budget}</p>
                  </div>
                  <span className={`rpt-priority rpt-priority--${r.priority.toLowerCase()}`}>{r.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ 05 GUEST EXPERIENCE ══ */}
        {activeSection === 'guest' && (
          <div>
            <SectionHeader number={5} title="Guest Experience" subtitle="Reviews, satisfaction metrics, and concierge performance" />
            <div className="rpt-review-grid">
              {[
                { platform: 'Airbnb', score: '4.95', count: 48 },
                { platform: 'Booking.com', score: '9.6', count: 31 },
                { platform: 'Google', score: '4.9', count: 22 },
              ].map(r => (
                <div key={r.platform} className="rpt-review-card">
                  <p className="rpt-review-card__platform">{r.platform}</p>
                  <p className="rpt-review-card__score">{r.score}</p>
                  <p className="rpt-review-card__count">{r.count} reviews</p>
                  <div className="rpt-stars">{'★★★★★'}</div>
                </div>
              ))}
            </div>
            <div className="rpt-stat-grid">
              {[
                { label: 'Avg. Response Time', value: '< 8 min', icon: '⚡' },
                { label: 'Repeat Guests', value: '34%', icon: '🔁' },
                { label: 'Requests Fulfilled', value: '98%', icon: '✅' },
                { label: 'Mid-stay Check-ins', value: '100%', icon: '🏠' },
              ].map(g => (
                <div key={g.label} className="rpt-stat rpt-stat--horizontal">
                  <span className="rpt-stat__icon">{g.icon}</span>
                  <div>
                    <p className="rpt-stat__value" style={{ color: TEAL }}>{g.value}</p>
                    <p className="rpt-stat__label">{g.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rpt-card">
              <h3 className="rpt-card__title">Guest Highlights</h3>
              {[
                { name: 'Sophie & Marc L.', origin: 'Paris, France', review: 'Absolutely stunning villa. The CHOWTO team was incredibly responsive — within minutes for every request. The welcome hamper and pre-arranged scooter rental were perfect touches.', score: '5.0' },
                { name: 'James T.', origin: 'London, UK', review: "Third time staying, and the standard keeps getting better. The property was immaculate. Special mention to the team for arranging a last-minute longtail boat trip for our anniversary.", score: '5.0' },
              ].map((r, i, arr) => (
                <div key={i} className={`rpt-review-row ${i < arr.length - 1 ? 'rpt-review-row--border' : ''}`}>
                  <div className="rpt-review-row__top">
                    <div>
                      <p className="rpt-review-row__name">{r.name}</p>
                      <p className="rpt-dim">📍 {r.origin}</p>
                    </div>
                    <span className="rpt-review-row__score">★ {r.score}</span>
                  </div>
                  <p className="rpt-review-row__text">"{r.review}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="rpt-footer">
          <div>
            <p className="rpt-footer__brand">CHOWTO Property Management</p>
            <p className="rpt-footer__sub">Koh Samui, Thailand · howtoniksen.com</p>
          </div>
          <p className="rpt-footer__note">Confidential · {period}</p>
        </div>
      </div>
    </div>
  )
}
