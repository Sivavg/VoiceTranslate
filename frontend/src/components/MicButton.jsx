export default function MicButton({ listening, onClick, supported }) {
  return (
    <div className="mic-control-center">
      {listening && <div className="mic-aura" aria-hidden="true" />}

      <button
        type="button"
        className={`studio-mic-btn${listening ? ' recording' : ''}`}
        onClick={onClick}
        disabled={!supported}
        aria-label={listening ? 'Stop recording studio session' : 'Start real-time recording session'}
        title={!supported ? 'Speech Recognition not supported in this browser. Please use Chrome or Edge.' : undefined}
      >
        {listening ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="7" y="7" width="10" height="10" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}
      </button>
    </div>
  )
}
