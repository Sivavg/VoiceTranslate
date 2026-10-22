import { useState, useCallback, useRef, useEffect } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useApp } from '../context/AppContext'
import MicButton from './MicButton'
import AudioVisualizer from './AudioVisualizer'
import TranscriptBox from './TranscriptBox'

const LANGUAGES = [
  { value: 'hi-IN-mixed', label: 'Hinglish (Hindi + English)' },
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi (हिंदी)' },
  { value: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { value: 'te-IN', label: 'Telugu (తెలుగు)' },
  { value: 'mr-IN', label: 'Marathi (मराठी)' },
  { value: 'bn-IN', label: 'Bengali (বাংলা)' },
  { value: 'en-US', label: 'English (United States)' },
]

const QUICK_LANGS = [
  { value: 'hi-IN-mixed', label: 'Hinglish' },
  { value: 'en-IN', label: 'English' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'ta-IN', label: 'Tamil' },
]

function pad(n) { return String(n).padStart(2, '0') }

export default function TranscribePanel({ onSaved }) {
  const { addToast } = useApp()
  const [language, setLanguage]         = useState('hi-IN-mixed')
  const [sessionTitle, setSessionTitle] = useState('')
  const [tags, setTags]                 = useState('')
  const [lines, setLines]               = useState([])
  const [interimText, setInterimText]   = useState('')
  const [seconds, setSeconds]           = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  // Speech recognition handlers
  const handleInterim = useCallback((text) => setInterimText(text), [])
  const handleFinal   = useCallback((text) => {
    setLines(prev => [...prev, text])
    setInterimText('')
  }, [])
  const handleError = useCallback((msg) => addToast(msg, 'error'), [addToast])

  const { listening, supported, toggle } = useSpeechRecognition({
    language: language === 'hi-IN-mixed' ? 'hi-IN' : language,
    onInterim: handleInterim,
    onFinal:   handleFinal,
    onError:   handleError,
  })

  // Timer
  useEffect(() => {
    if (listening) {
      startTimeRef.current = Date.now() - seconds * 1000
      timerRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [listening])

  const timecode = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
  const wordCount = lines.join(' ').trim().split(/\s+/).filter(Boolean).length

  // Handlers
  const handleCopy = () => {
    const text = lines.join('\n')
    if (!text) return addToast('No transcript to copy', 'error')
    navigator.clipboard.writeText(text)
      .then(() => addToast('Copied to clipboard', 'success'))
      .catch(() => addToast('Failed to copy', 'error'))
  }

  const handleExportTxt = () => {
    const text = lines.join('\n')
    if (!text) return addToast('No transcript to export', 'error')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Downloaded .txt file', 'success')
  }

  const handleClear = () => {
    setLines([])
    setInterimText('')
    setSeconds(0)
  }

  const handleSave = async () => {
    const content = lines.join('\n').trim()
    if (!content) return addToast('Please speak something before saving', 'error')
    
    const defaultTitle = `Speech Note - ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    const title = sessionTitle.trim() || defaultTitle
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)

    try {
      await onSaved({
        title,
        content,
        language,
        duration_seconds: seconds,
        tags: tagArr,
      })
      addToast('Transcription saved successfully', 'success')
      handleClear()
      setSessionTitle('')
      setTags('')
    } catch (err) {
      addToast('Save failed: ' + err.message, 'error')
    }
  }

  return (
    <section className="studio-console">
      {/* Panel Header */}
      <div className="panel-header">
        <h1 className="panel-title">Real-Time Speech to Text</h1>
        <p className="panel-subtitle">
          Speak in Hindi, English, Hinglish, or regional languages. Your voice will be transcribed in real-time.
        </p>
      </div>

      {/* Toolbar: Language Selection */}
      <div className="studio-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Language:</span>
          
          <div className="lang-selector-wrap">
            <select
              className="lang-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={listening}
              aria-label="Select language"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <span className="lang-arrow">▼</span>
          </div>

          {/* Quick switcher buttons */}
          <div className="lang-pills">
            {QUICK_LANGS.map(q => (
              <button
                key={q.value}
                type="button"
                className={`lang-pill${language === q.value ? ' active' : ''}`}
                onClick={() => !listening && setLanguage(q.value)}
                disabled={listening}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer display */}
        <div className="studio-telemetry">
          <div className={`timecode-display${listening ? ' active' : ''}`}>
            <span className="timecode-dot" />
            <span>{listening ? `Recording ${timecode}` : timecode}</span>
          </div>
        </div>
      </div>

      {/* Audio Waveform & Mic Button */}
      <div className="studio-waveform-hud">
        <AudioVisualizer listening={listening} />
        
        <div className="mic-control-center">
          <MicButton listening={listening} onClick={toggle} supported={supported} />
        </div>

        <p className="mic-hint">
          {listening
            ? 'Listening to speech... click to stop'
            : 'Click the microphone to start speaking'}
        </p>
      </div>

      {/* Transcript Window */}
      <div className="transcript-studio-box">
        <TranscriptBox
          lines={lines}
          interimText={interimText}
          wordCount={wordCount}
          onCopy={handleCopy}
          onClear={handleClear}
          onExportTxt={handleExportTxt}
        />

        {/* Save to DB Drawer */}
        <div className="studio-save-drawer">
          <div className="save-inputs">
            <input
              type="text"
              className="studio-input"
              placeholder="Title (optional, e.g. Customer Call Notes)"
              value={sessionTitle}
              onChange={e => setSessionTitle(e.target.value)}
              maxLength={90}
            />
            <input
              type="text"
              className="studio-input"
              style={{ maxWidth: 220 }}
              placeholder="Tags (e.g. meeting, client)"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="studio-btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={lines.length === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={lines.length === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              Save Transcription
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
