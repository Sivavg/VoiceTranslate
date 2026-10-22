import { useEffect, useRef } from 'react'

export default function AudioVisualizer({ listening }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (!listening) {
      cancelAnimationFrame(animRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      drawRestingState(ctx, canvas.width, canvas.height)
      return
    }

    // Capture user mic for real audio visualization
    navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const analyzer = audioCtx.createAnalyser()
      analyzer.fftSize = 128
      analyzer.smoothingTimeConstant = 0.8
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyzer)
      
      const bufferLength = analyzer.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const render = () => {
        animRef.current = requestAnimationFrame(render)
        analyzer.getByteFrequencyData(dataArray)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 1.8
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height * 0.85)

          // Electric emerald to cobalt gradient for live voice
          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0)
          grad.addColorStop(0, '#10B981')
          grad.addColorStop(0.6, '#3B82F6')
          grad.addColorStop(1, '#60A5FA')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight, 2)
          ctx.fill()

          x += barWidth + 1
        }
      }
      render()
    }).catch(() => {
      drawSimulatedWaves(ctx, canvas.width, canvas.height)
    })

    return () => {
      cancelAnimationFrame(animRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [listening])

  function drawRestingState(ctx, w, h) {
    ctx.clearRect(0, 0, w, h)
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  function drawSimulatedWaves(ctx, w, h) {
    let phase = 0
    const renderSim = () => {
      animRef.current = requestAnimationFrame(renderSim)
      ctx.clearRect(0, 0, w, h)
      phase += 0.08
      const barCount = 48
      const barWidth = w / barCount

      for (let i = 0; i < barCount; i++) {
        const height = Math.abs(Math.sin(phase + i * 0.2)) * 32 + 6
        ctx.fillStyle = 'rgba(59, 130, 246, 0.75)'
        ctx.beginPath()
        ctx.roundRect(i * barWidth, (h - height) / 2, barWidth - 3, height, 2)
        ctx.fill()
      }
    }
    renderSim()
  }

  return (
    <div className="waveform-canvas-container" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        width={960}
        height={64}
      />
    </div>
  )
}
