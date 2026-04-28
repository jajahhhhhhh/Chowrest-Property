#!/bin/bash
set -e
echo "Setting up Report feature..."

# 1. Update App.tsx
cat > src/App.tsx << 'EOF'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Listings from '@/pages/Listings'
import PropertyDetail from '@/pages/PropertyDetail'
import Dashboard from '@/pages/Dashboard'
import Report from '@/pages/Report'

function AgentRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, initialized } = useAuthStore()
  if (!initialized) return null
  if (!user || profile?.role !== 'agent') return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/auth"         element={<Auth />} />
        <Route path="/listings"     element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/dashboard"    element={<AgentRoute><Dashboard /></AgentRoute>} />
        <Route path="/report/:id"   element={<AgentRoute><Report /></AgentRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
EOF
echo "App.tsx done"

# 2. Report button CSS - append to Dashboard.css
cat >> src/pages/Dashboard.css << 'EOF'
.dash-action-btn--report { background: rgba(61,122,106,0.12); color: #3d7a6a; border-color: rgba(61,122,106,0.3); }
.dash-action-btn--report:hover { background: rgba(61,122,106,0.25); }
.upload-zone { border:2px dashed var(--border,#e8e3d8); border-radius:10px; padding:36px 20px; text-align:center; cursor:pointer; transition:border-color 0.2s,background 0.2s; display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--bg-soft,#faf9f6); margin-top:8px; }
.upload-zone:hover { border-color:var(--teal,#5a7f6f); background:rgba(90,127,111,0.04); }
.upload-zone--busy { cursor:wait; opacity:0.7; }
.upload-zone__icon { font-size:32px; }
.upload-zone__text { font-size:14px; color:var(--text-soft,#a39d8e); line-height:1.5; }
.upload-zone__text small { font-size:12px; }
.upload-zone__spinner { font-size:14px; color:var(--teal,#5a7f6f); }
.upload-error { color:#c0392b; font-size:13px; margin-top:6px; }
.added-images { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:10px; margin-top:14px; }
.added-image { position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; border:1px solid var(--border,#e8e3d8); }
.added-image img { width:100%; height:100%; object-fit:cover; display:block; }
.added-image__cover { position:absolute; bottom:4px; left:4px; font-size:10px; font-weight:700; background:rgba(90,127,111,0.9); color:#fff; padding:2px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:0.05em; }
.added-image__remove { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; border:none; background:rgba(0,0,0,0.55); color:#fff; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
.added-image__remove:hover { background:rgba(192,57,43,0.85); }
EOF
echo "Dashboard.css done"

# 3. Report.css
cat > src/pages/Report.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
.rpt{font-family:'DM Sans',sans-serif;background:#0e100e;min-height:100vh;color:#f0ece4}
.rpt-topbar{display:flex;justify-content:space-between;align-items:center;padding:12px 40px;background:#111310;border-bottom:1px solid #1e2018;position:sticky;top:0;z-index:100}
.rpt-back{color:#6a6860;text-decoration:none;font-size:13px;transition:color .2s}
.rpt-back:hover{color:#3d7a6a}
.rpt-topbar__right{display:flex;align-items:center;gap:12px}
.rpt-draft-badge{background:#2a2a18;color:#c9a84c;font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;letter-spacing:.08em;text-transform:uppercase}
.rpt-print-btn{background:#3d7a6a;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;font-weight:500;transition:background .2s}
.rpt-print-btn:hover{background:#4d9a8a}
.rpt-cover{position:relative;height:320px;overflow:hidden;display:flex;align-items:flex-end}
.rpt-cover__photo{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.5)}
.rpt-cover__overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,14,10,.95) 0%,rgba(10,14,10,.3) 60%,transparent 100%)}
.rpt-cover__content{position:relative;padding:40px;width:100%;max-width:900px;margin:0 auto}
.rpt-cover__brand{color:#c9a84c;font-size:11px;letter-spacing:.25em;text-transform:uppercase;margin-bottom:10px}
.rpt-cover__title{font-family:'Playfair Display',serif;font-size:38px;font-weight:700;letter-spacing:-.03em;line-height:1.1;margin-bottom:8px}
.rpt-cover__type{color:#a09a8e;font-size:14px}
.rpt-cover__location{color:#6a6860;font-size:13px;margin-top:4px}
.rpt-cover__meta{display:flex;gap:32px;margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.1)}
.rpt-cover__meta-label{color:#6a6860;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.rpt-cover__meta-value{font-family:'Playfair Display',serif;font-size:18px;color:#f0ece4}
.rpt-nav{background:#111310;border-bottom:1px solid #1e2018;display:flex;overflow-x:auto;padding:0 40px;position:sticky;top:49px;z-index:90}
.rpt-nav__btn{background:none;border:none;cursor:pointer;padding:14px 18px;font-size:13px;font-family:'DM Sans',sans-serif;color:#6a6860;border-bottom:2px solid transparent;white-space:nowrap;transition:color .2s}
.rpt-nav__btn--active{color:#3d7a6a;border-bottom-color:#3d7a6a;font-weight:600}
.rpt-nav__btn:hover:not(.rpt-nav__btn--active){color:#a09a8e}
.rpt-body{max-width:900px;margin:0 auto;padding:48px 40px}
.rpt-section-header{margin-bottom:32px}
.rpt-section-header__row{display:flex;align-items:baseline;gap:16px;margin-bottom:6px}
.rpt-section-num{font-family:'Playfair Display',serif;font-size:13px;color:#c9a84c;letter-spacing:.15em;text-transform:uppercase}
.rpt-section-rule{flex:1;height:1px;background:linear-gradient(to right,rgba(61,122,106,.3),transparent)}
.rpt-section-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#f0ece4;letter-spacing:-.02em}
.rpt-section-sub{color:#8a8678;font-size:14px;margin-top:6px}
.rpt-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin-bottom:32px}
.rpt-kpi{background:linear-gradient(135deg,#1e2420,#161814);border:1px solid #2e3830;border-radius:12px;padding:22px 18px;position:relative;overflow:hidden}
.rpt-kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,#3d7a6a,transparent)}
.rpt-kpi__label{color:#8a8678;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px}
.rpt-kpi__value{font-family:'Playfair Display',serif;font-size:26px;color:#f0ece4;font-weight:700;margin-bottom:8px}
.rpt-kpi__sub{font-size:12px;display:flex;align-items:center;gap:4px}
.rpt-kpi__sub--up{color:#5ba888}
.rpt-kpi__sub--down{color:#c0614a}
.rpt-card{background:#131510;border:1px solid #1e2018;border-radius:14px;padding:28px;margin-bottom:24px}
.rpt-card--narrative,.rpt-card--recommend{border-color:#2e2a1a}
.rpt-card__title{font-family:'Playfair Display',serif;font-size:18px;color:#f0ece4;margin-bottom:8px}
.rpt-card__sub{color:#6a6860;font-size:13px;margin-bottom:20px}
.rpt-prose{color:#a09a8e;line-height:1.8;font-size:14px}
.rpt-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;margin-bottom:24px}
.rpt-stat{background:#1a1c18;border:1px solid #252820;border-radius:10px;padding:20px 18px}
.rpt-stat--icon{text-align:center}
.rpt-stat--horizontal{display:flex;align-items:center;gap:14px}
.rpt-stat__icon{font-size:26px;display:block;margin-bottom:8px}
.rpt-stat--horizontal .rpt-stat__icon{margin-bottom:0}
.rpt-stat__label{color:#6a6860;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.rpt-stat--icon .rpt-stat__label{margin-top:8px;margin-bottom:0}
.rpt-stat__value{font-family:'Playfair Display',serif;font-size:22px;color:#f0ece4;font-weight:600}
.rpt-stat__sub{color:#3d7a6a;font-size:12px;margin-top:6px}
.rpt-table-wrap{overflow-x:auto}
.rpt-table{width:100%;border-collapse:collapse;font-size:13px}
.rpt-table thead tr{border-bottom:1px solid #2e3028}
.rpt-table th{padding:8px 12px;color:#6a6860;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;text-align:left}
.rpt-table td{padding:11px 12px;border-bottom:1px solid #1a1c18;color:#8a8678}
.rpt-table__total td{background:rgba(61,122,106,.05)}
.rpt-dim{color:#6a6860}
.rpt-expense-list{display:flex;flex-direction:column;gap:14px;margin-top:20px}
.rpt-expense-row__top{display:flex;justify-content:space-between;font-size:13px;color:#a09a8e;margin-bottom:6px}
.rpt-expense-bar{height:6px;background:#1e2018;border-radius:3px;overflow:hidden}
.rpt-expense-bar__fill{height:100%;background:linear-gradient(to right,#3d7a6a,rgba(61,122,106,.5));border-radius:3px}
.rpt-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600}
.rpt-badge--green{background:#1a3028;color:#3d7a6a}
.rpt-rec-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0}
.rpt-rec-row--border{border-bottom:1px solid #1e2018}
.rpt-rec-row__title{color:#a09a8e;font-size:14px}
.rpt-rec-row__budget{color:#6a6860;font-size:12px;margin-top:3px}
.rpt-priority{padding:3px 12px;border-radius:999px;font-size:11px;font-weight:600}
.rpt-priority--high{background:#3a1a18;color:#c0614a}
.rpt-priority--medium{background:#2a2a18;color:#c9a84c}
.rpt-priority--low{background:#1a2018;color:#3d7a6a}
.rpt-review-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px}
.rpt-review-card{background:#1a1c18;border:1px solid #252820;border-radius:12px;padding:24px;text-align:center}
.rpt-review-card__platform{color:#6a6860;font-size:12px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px}
.rpt-review-card__score{font-family:'Playfair Display',serif;font-size:36px;color:#c9a84c;font-weight:700}
.rpt-review-card__count{color:#8a8678;font-size:13px;margin-top:6px}
.rpt-stars{color:#c9a84c;font-size:14px;margin-top:10px;letter-spacing:2px}
.rpt-review-row{padding:20px 0}
.rpt-review-row--border{border-bottom:1px solid #1e2018}
.rpt-review-row__top{display:flex;justify-content:space-between;margin-bottom:10px}
.rpt-review-row__name{color:#f0ece4;font-size:14px;font-weight:500}
.rpt-review-row__score{font-family:'Playfair Display',serif;font-size:20px;color:#c9a84c}
.rpt-review-row__text{color:#8a8678;font-size:14px;line-height:1.7;font-style:italic}
.rpt-tooltip{background:#1a1a18;border:1px solid #3d7a6a;border-radius:8px;padding:10px 16px;font-size:13px;font-family:'DM Sans',sans-serif}
.rpt-tooltip__label{color:#c9a84c;margin-bottom:6px;font-weight:600}
.rpt-footer{margin-top:64px;padding-top:32px;border-top:1px solid #1e2018;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.rpt-footer__brand{font-family:'Playfair Display',serif;color:#c9a84c;font-size:14px;font-weight:600}
.rpt-footer__sub{color:#4a4a42;font-size:12px;margin-top:4px}
.rpt-footer__note{color:#4a4a42;font-size:12px}
.rpt-loading{display:flex;align-items:center;justify-content:center;height:100vh;font-size:16px;color:#6a6860;background:#0e100e}
@media print{.no-print{display:none!important}.rpt{background:#fff;color:#1a1a18}.rpt-cover{height:200px}.rpt-card{break-inside:avoid;border-color:#ddd;background:#fafafa}.rpt-body{padding:24px}}
EOF
echo "Report.css done"

echo ""
echo "Done! Now run: git add -A && git commit -m 'feat: report page' && git push"
