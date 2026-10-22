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
  if (!d) return ''
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(secs) {
  if (!secs) return '0s'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function ViewModal({ transcription, onClose, onEdit, onDelete }) {
  const { id, title, content, language, word_count, tags, is_favorite, created_at, duration_seconds } = transcription || {}

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="view-modal-title">
      <div className="modal-dialog" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {is_favorite && (
              <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth={1.5} style={{ width: 18, height: 18 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            <h3 className="modal-heading" id="view-modal-title">{title}</h3>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata badges */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="lang-chip">{LANG_NAMES[language] || language}</span>
            <span className="metric-chip">{word_count ?? 0} words</span>
            <span className="metric-chip">{formatDuration(duration_seconds)} recorded</span>
          </div>

          {/* Content display */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="control-label">Full Transcript</span>
              <button type="button" className="action-btn-sm" onClick={handleCopy}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <div
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                maxHeight: '260px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {content}
            </div>
          </div>

          {/* Tags */}
          {tags?.length > 0 && (
            <div>
              <span className="control-label" style={{ display: 'block', marginBottom: 6 }}>Tags</span>
              <div className="tag-pills">
                {tags.map((t, i) => (
                  <span key={i} className="tag-pill">#{t}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Recorded on: {formatDate(created_at)}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onDelete(id)
              onClose()
            }}
          >
            Delete
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onEdit(transcription)
              onClose()
            }}
          >
            Edit Record
          </button>
        </div>
      </div>
    </div>
  )
}
