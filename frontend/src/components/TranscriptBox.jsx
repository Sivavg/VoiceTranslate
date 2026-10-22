import { useRef, useEffect } from 'react'

export default function TranscriptBox({ lines, interimText, wordCount, onCopy, onClear, onExportTxt }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [lines, interimText])

  const charCount = lines.join(' ').length

  return (
    <>
      {/* Box Header Toolbar */}
      <div className="studio-box-header">
        <div className="studio-box-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Transcript
        </div>

        <div className="studio-box-actions">
          <span className="metric-tag">{wordCount} words</span>
          <span className="metric-tag">{charCount} characters</span>

          <button
            type="button"
            className="action-btn-sm"
            onClick={onCopy}
            title="Copy text to clipboard"
            aria-label="Copy transcript"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>

          <button
            type="button"
            className="action-btn-sm"
            onClick={onExportTxt}
            title="Download as text file"
            aria-label="Export TXT"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>

          <button
            type="button"
            className="action-btn-sm"
            onClick={onClear}
            title="Clear text"
            aria-label="Clear transcript"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Main Transcript Viewport */}
      <div
        className="transcript-viewport"
        ref={contentRef}
        aria-live="polite"
        aria-label="Real-time speech transcription log"
      >
        {lines.length === 0 && !interimText ? (
          <div className="empty-studio-state">
            <div className="empty-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <div className="empty-studio-text">Ready to transcribe</div>
            <div className="empty-studio-sub">
              Click the microphone button and start speaking in your selected language.
            </div>
          </div>
        ) : (
          <>
            {lines.map((line, i) => (
              <p key={i} className="transcript-line">
                {line}
              </p>
            ))}

            {interimText && (
              <p className="interim-line">
                {interimText}
                <span className="typing-cursor" aria-hidden="true" />
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
