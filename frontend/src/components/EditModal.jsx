import { useEffect, useRef } from 'react'

const LANGUAGES = [
  { value: 'hi-IN-mixed', label: 'Hinglish (Hindi + English Auto)' },
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi (हिंदी)' },
  { value: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { value: 'te-IN', label: 'Telugu (తెలుగు)' },
  { value: 'mr-IN', label: 'Marathi (मराठी)' },
  { value: 'bn-IN', label: 'Bengali (বাংলা)' },
  { value: 'en-US', label: 'English (United States)' },
]

export function EditModal({ transcription, onClose, onSave }) {
  const idRef      = useRef()
  const titleRef   = useRef()
  const langRef    = useRef()
  const contentRef = useRef()
  const tagsRef    = useRef()

  useEffect(() => {
    if (transcription) {
      titleRef.current.value   = transcription.title || ''
      langRef.current.value    = transcription.language || 'en-IN'
      contentRef.current.value = transcription.content || ''
      tagsRef.current.value    = (transcription.tags || []).join(', ')
    }
  }, [transcription])

  const handleSave = () => {
    const payload = {
      title:    titleRef.current.value.trim(),
      language: langRef.current.value,
      content:  contentRef.current.value.trim(),
      tags:     tagsRef.current.value.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (!payload.title || !payload.content) return
    onSave(transcription.id, payload)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-heading" id="edit-modal-title">Edit Transcription Record</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <input type="hidden" ref={idRef} />

          <div className="form-group">
            <label className="control-label" htmlFor="edit-title">Session Title</label>
            <input ref={titleRef} id="edit-title" type="text" className="styled-input" placeholder="Title..." maxLength={100} />
          </div>

          <div className="form-group">
            <label className="control-label" htmlFor="edit-lang">Language Tag</label>
            <div className="lang-selector-wrap">
              <select ref={langRef} id="edit-lang" className="styled-select">
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <span className="lang-arrow">▼</span>
            </div>
          </div>

          <div className="form-group">
            <label className="control-label" htmlFor="edit-content">Transcript Content</label>
            <textarea ref={contentRef} id="edit-content" className="styled-textarea" rows={6} placeholder="Content..." />
          </div>

          <div className="form-group">
            <label className="control-label" htmlFor="edit-tags">Tags (Comma-Separated)</label>
            <input ref={tagsRef} id="edit-tags" type="text" className="styled-input" placeholder="e.g. hinglish, meeting, notes" />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
