import { useState, useEffect } from 'react'
import TranscriptionCard from './TranscriptionCard'
import { EditModal } from './EditModal'
import { ViewModal } from './ViewModal'
import { useApp } from '../context/AppContext'

export default function HistoryPanel({ transcriptions, onRefresh, onUpdate, onDelete, onFavorite }) {
  const { addToast } = useApp()
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')   // 'all' | 'favorites'
  const [sort, setSort]             = useState('newest')
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)

  // Close modals on Escape
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') {
        setEditTarget(null)
        setViewTarget(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Filtered + sorted list
  const displayed = transcriptions
    .filter(t => {
      if (filter === 'favorites' && !t.is_favorite) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          t.title?.toLowerCase().includes(q) ||
          t.content?.toLowerCase().includes(q) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sort === 'words')  return (b.word_count ?? 0) - (a.word_count ?? 0)
      return 0
    })

  const handleUpdate = async (id, payload) => {
    try {
      await onUpdate(id, payload)
      addToast('Transcription updated successfully', 'success')
      setEditTarget(null)
    } catch (err) {
      addToast('Update failed: ' + err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) return
    try {
      await onDelete(id)
      addToast('Transcription deleted', 'info')
    } catch (err) {
      addToast('Delete failed: ' + err.message, 'error')
    }
  }

  const handleFavorite = async (id) => {
    try {
      const res = await onFavorite(id)
      addToast(res.message || 'Updated', 'success')
    } catch {
      addToast('Failed to toggle favorite', 'error')
    }
  }

  return (
    <section>
      {/* Panel Header */}
      <div className="panel-header">
        <h2 className="panel-title">Transcription History</h2>
        <p className="panel-subtitle">
          Search, edit, export, and manage your saved voice transcriptions.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div className="history-controls">
        <div className="search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search transcriptions by title, content, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search transcriptions"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-segments">
            <button
              type="button"
              className={`filter-seg${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({transcriptions.length})
            </button>
            <button
              type="button"
              className={`filter-seg${filter === 'favorites' ? ' active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              Favorites ({transcriptions.filter(t => t.is_favorite).length})
            </button>
          </div>

          <div className="lang-selector-wrap">
            <select
              className="lang-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sort transcriptions"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="words">Most Words</option>
            </select>
            <span className="lang-arrow">▼</span>
          </div>

          <button
            type="button"
            className="action-btn-sm"
            onClick={onRefresh}
            title="Refresh list"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {displayed.length === 0 ? (
        <div className="empty-studio-state" style={{ background: 'var(--grad-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div className="empty-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="empty-studio-text">
            {search ? 'No transcriptions match your search' : 'No transcriptions saved yet'}
          </div>
          <div className="empty-studio-sub">
            {search ? 'Try searching with different keywords.' : 'Go to Transcribe to record and save your first audio note.'}
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {displayed.map(t => (
            <TranscriptionCard
              key={t.id}
              transcription={t}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              onView={setViewTarget}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          transcription={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdate}
        />
      )}

      {/* View Modal */}
      {viewTarget && (
        <ViewModal
          transcription={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={setEditTarget}
          onDelete={handleDelete}
        />
      )}
    </section>
  )
}
