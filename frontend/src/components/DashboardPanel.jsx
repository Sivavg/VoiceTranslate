import { useApp } from '../context/AppContext'

const LANG_NAMES = {
  'hi-IN-mixed': 'Hinglish (Hindi + English)',
  'en-IN': 'English (India)',
  'hi-IN': 'Hindi (हिंदी)',
  'ta-IN': 'Tamil (தமிழ்)',
  'te-IN': 'Telugu (తెలుగు)',
  'mr-IN': 'Marathi (मराठी)',
  'bn-IN': 'Bengali (বাংলা)',
  'en-US': 'English (US)',
}

function formatDate(d) {
  if (!d) return 'Recent'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDuration(secs) {
  if (!secs) return '0s'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function KPICard({ icon, value, label }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-box">{icon}</div>
      <div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPanel({ stats, transcriptions, onRefresh }) {
  const { setActiveTab } = useApp()

  // Compute language distribution from transcriptions list
  const langMap = {}
  transcriptions.forEach(t => {
    const l = t.language || 'en-IN'
    langMap[l] = (langMap[l] || 0) + 1
  })
  const langEntries = Object.entries(langMap).sort((a, b) => b[1] - a[1])
  const maxLangCount = langEntries[0]?.[1] || 1

  const total    = stats?.total_transcriptions ?? transcriptions.length
  const words    = stats?.total_words ?? transcriptions.reduce((s, t) => s + (t.word_count || 0), 0)
  const duration = stats?.total_duration ?? transcriptions.reduce((s, t) => s + (t.duration_seconds || 0), 0)
  const favs     = stats?.favorites ?? transcriptions.filter(t => t.is_favorite).length
  const recent   = stats?.recent || transcriptions.slice(0, 5)

  return (
    <section>
      {/* Panel Header */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="panel-title">Dashboard</h2>
          <p className="panel-subtitle">Usage statistics and language distribution overview.</p>
        </div>

        <button type="button" className="action-btn-sm" onClick={onRefresh} title="Refresh stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <KPICard
          value={total}
          label="Total Transcriptions"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />

        <KPICard
          value={words.toLocaleString()}
          label="Total Words"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
        />

        <KPICard
          value={formatDuration(duration)}
          label="Recording Duration"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <KPICard
          value={favs}
          label="Favorites"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Language Breakdown */}
        <div className="dashboard-section">
          <div className="section-head">
            <h3 className="section-title">Language Breakdown</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {langEntries.length} languages
            </span>
          </div>

          {langEntries.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No language data available yet.</p>
          ) : (
            <div className="lang-dist-list">
              {langEntries.map(([code, count]) => {
                const percent = Math.round((count / (total || 1)) * 100)
                return (
                  <div key={code} className="lang-dist-item">
                    <div className="dist-meta">
                      <span style={{ color: 'var(--text-primary)' }}>
                        {LANG_NAMES[code] || code}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="dist-bar-track">
                      <div
                        className="dist-bar-fill"
                        style={{ width: `${(count / maxLangCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Transcriptions */}
        <div className="dashboard-section">
          <div className="section-head">
            <h3 className="section-title">Recent Transcriptions</h3>
            <button
              type="button"
              className="action-btn-sm"
              onClick={() => setActiveTab('history')}
            >
              View All
            </button>
          </div>

          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent transcriptions found.</p>
          ) : (
            <div className="recent-ledger">
              {recent.map(t => (
                <div
                  key={t.id}
                  className="ledger-item"
                  onClick={() => setActiveTab('history')}
                >
                  <div>
                    <div className="ledger-title">{t.title}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {LANG_NAMES[t.language] || t.language} • {t.word_count || 0} words
                    </div>
                  </div>
                  <div className="ledger-date">{formatDate(t.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
