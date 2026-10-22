import { useRef, useState, useCallback, useEffect } from 'react'

const SUPPORTED_LANGUAGES = {
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'hi-IN-mixed': 'hi-IN', // Treat bilingual as Hindi – browser picks up code-switching naturally
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'mr-IN': 'mr-IN',
  'bn-IN': 'bn-IN',
  'kn-IN': 'kn-IN',
  'ml-IN': 'ml-IN',
  'gu-IN': 'gu-IN',
}

export function useSpeechRecognition({ language = 'en-IN', onInterim, onFinal, onError }) {
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
    }
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      onError?.('Speech Recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = SUPPORTED_LANGUAGES[language] || 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onstart = () => setListening(true)

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalTranscript += text + ' '
        } else {
          interimTranscript += text
        }
      }

      if (interimTranscript) onInterim?.(interimTranscript)
      if (finalTranscript) onFinal?.(finalTranscript.trim())
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError?.(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setListening(false)
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current?.autoRestart) {
        recognitionRef.current?.start()
        setListening(true)
      }
    }

    recognitionRef.current = recognition
    recognitionRef.current.autoRestart = true
    recognition.start()
  }, [language, onInterim, onFinal, onError])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.autoRestart = false
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return { listening, supported, start, stop, toggle }
}
