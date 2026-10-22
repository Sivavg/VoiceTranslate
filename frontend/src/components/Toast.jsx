import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toasts, removeToast } = useApp()

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="assertive">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          role="alert"
          onClick={() => removeToast(t.id)}
          title="Click to dismiss"
        >
          <span className="toast-dot" aria-hidden="true" />
          {t.message}
        </div>
      ))}
    </div>
  )
}
