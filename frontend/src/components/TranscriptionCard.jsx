const LANG_META = {
  'hi-IN-mixed': { label: 'Hinglish (Mixed)', code: 'HINGLISH', isMixed: true },
  'en-IN': { label: 'English (India)', code: 'EN-IN' },
  'hi-IN': { label: 'Hindi (हिंदी)', code: 'HI-IN' },
  'ta-IN': { label: 'Tamil (தமிழ்)', code: 'TA-IN' },
  'te-IN': { label: 'Telugu (తెలుగు)', code: 'TE-IN' },
  'mr-IN': { label: 'Marathi (मराठी)', code: 'MR-IN' },
  'bn-IN': { label: 'Bengali (বাংলা)', code: 'BN-IN' },
  'en-US': { label: 'English (US)', code: 'EN-US' },
}

function formatDate(dateStr) {
  if (!dateStr) return 'Just now'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDuration(secs) {
  if (!secs) return '< 10s'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function TranscriptionCard({ transcription, onEdit, onDelete, onView, onFavorite }) {
  const { id, title, content, language, word_count, tags, is_favorite, created_at, duration_seconds } = transcription
  const preview = content?.length > 130 ? content.slice(0, 130) + '…' : content
  const langInfo = LANG_META[language] || { label: language || 'EN', code: language || 'EN' }

  return (
    <article className="history-card" onClick={() => onView(transcription)}>
      {/* Card Header */}
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>

        <button
          type="button"
          className={`fav-star-btn${is_favorite ? ' active' : ''}`}
          onClick={e => {
            e.stopPropagation()
            onFavorite(id)
          }}
          aria-label={is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
          title={is_favorite ? 'Favorited' : 'Add to favorites'}
        >
          <svg viewBox="0 0 24 24" fill={is_favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* Preview Snippet */}
      <p className="card-preview">{preview}</p>

      {/* Badges & Metrics */}
      <div className="card-badges">
        <span className={`lang-chip${langInfo.isMixed ? ' mixed' : ''}`}>
          {langInfo.code}
        </span>
        <span className="metric-chip">{word_count ?? 0} words</span>
        <span className="metric-chip">{formatDuration(duration_seconds)}</span>
        <span className="metric-chip" style={{ marginLeft: 'auto' }}>{formatDate(created_at)}</span>
      </div>

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="tag-pills">
          {tags.map((tag, i) => (
            <span key={i} className="tag-pill">#{tag.trim()}</span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="card-actions-bar" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="btn-card-action"
          onClick={() => onView(transcription)}
          aria-label="View transcription details"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View
        </button>

        <button
          type="button"
          className="btn-card-action"
          onClick={() => onEdit(transcription)}
          aria-label="Edit transcription"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>

        <button
          type="button"
          className="btn-card-action danger"
          onClick={() => onDelete(id)}
          aria-label="Delete transcription"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  )
}
