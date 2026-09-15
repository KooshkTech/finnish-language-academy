'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { BlackboardBlock } from '@/types/classroom'

type ChalkColor = '#f7f2d0' | '#76c7ff' | '#89e3a2' | '#ff8f82'
type ToolMode = 'chalk' | 'eraser'

export function Blackboard({
  blocks,
  status,
  storageKey = 'opiope-blackboard-general',
  language = 'fi',
}: {
  blocks: BlackboardBlock[]
  status?: 'normal' | 'detention'
  storageKey?: string
  language?: 'fi' | 'sv'
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [tool, setTool] = useState<ToolMode>('chalk')
  const [chalkColor, setChalkColor] = useState<ChalkColor>('#f7f2d0')
  const [smartNotes, setSmartNotes] = useState<Array<{ title: string; body: string }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return

    const restore = () => {
      const rect = container.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(rect.width * ratio))
      canvas.height = Math.max(1, Math.round(rect.height * ratio))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) return
      const image = new Image()
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height)
      image.src = saved
    }

    restore()
    const observer = new ResizeObserver(restore)
    observer.observe(container)
    return () => observer.disconnect()
  }, [storageKey])

  useEffect(() => {
    function receiveSmartNote(event: Event) {
      const custom = event as CustomEvent<{ title?: string; body?: string }>
      if (!custom.detail?.body) return
      setSmartNotes(current => [{ title: custom.detail.title ?? (language === 'sv' ? 'Tarkka-analys' : 'Tarkka analyysi'), body: custom.detail.body ?? '' }, ...current].slice(0, 3))
    }
    window.addEventListener('opiope:blackboard-note', receiveSmartNote)
    return () => window.removeEventListener('opiope:blackboard-note', receiveSmartNote)
  }, [language])

  function point(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = point(event)
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !lastPointRef.current) return
    const canvas = event.currentTarget
    const context = canvas.getContext('2d')
    if (!context) return
    const next = point(event)
    context.save()
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    context.strokeStyle = chalkColor
    context.lineWidth = tool === 'eraser' ? 24 : 3.2
    context.globalAlpha = tool === 'eraser' ? 1 : 0.9
    context.beginPath()
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    context.lineTo(next.x, next.y)
    context.stroke()
    context.restore()
    lastPointRef.current = next
  }

  function stopDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    drawingRef.current = false
    lastPointRef.current = null
    const canvas = event.currentTarget
    try {
      window.localStorage.setItem(storageKey, canvas.toDataURL('image/png'))
    } catch {
      // Blackboard still works if private browsing/storage prevents persistence.
    }
  }

  function clearBoard() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    window.localStorage.removeItem(storageKey)
  }

  const sv = language === 'sv'
  return <section className={`blackboard ${status === 'detention' ? 'detention' : ''}`} aria-label={sv ? 'Interaktiv skrivtavla' : 'Interaktiivinen liitutaulu'}>
    <div className="board-top"><span>OPIOPE BLACKBOARD</span><span>{status === 'detention' ? (sv ? 'REPETITION KRÄVS' : 'KERTAUS TARVITAAN') : (sv ? 'SKRIV PÅ TAVLAN' : 'KIRJOITA LIIDULLA')}</span></div>
    <div className="board-content">{smartNotes.map((note,index)=><article className="smart-board-note" key={`smart-${index}`}><h3>{note.title}</h3><p>{note.body}</p></article>)}{blocks.map((block, index) => {
      if (block.type === 'note') return <article key={index}><h3>{block.title}</h3><p>{block.body}</p></article>
      if (block.type === 'compare') return <article key={index}><h3>{block.title}</h3><div className="board-compare"><div><small>{block.leftLabel}</small><strong>{block.left}</strong></div><span>→</span><div><small>{block.rightLabel}</small><strong>{block.right}</strong></div></div></article>
      return <article key={index}><h3>{block.title}</h3><div className="board-table">{block.rows.map(([a,b]) => <div key={`${a}-${b}`}><span>{a}</span><strong>{b}</strong></div>)}</div></article>
    })}</div>

    <div className="chalk-pad-shell">
      <div className="chalk-toolbar" aria-label={sv ? 'Verktyg för skrivtavlan' : 'Liitutaulun kirjoitustyökalut'}>
        <button type="button" aria-pressed={tool === 'chalk'} onClick={() => setTool('chalk')}>{sv ? '✎ Krita' : '✎ Liitu'}</button>
        <button type="button" aria-pressed={tool === 'eraser'} onClick={() => setTool('eraser')}>{sv ? '⌫ Sudd' : '⌫ Pyyhin'}</button>
        <div className="chalk-colors" aria-label={sv ? 'Kritans färg' : 'Liidun väri'}>
          {(['#f7f2d0','#76c7ff','#89e3a2','#ff8f82'] as ChalkColor[]).map(color => <button key={color} type="button" className="chalk-color" aria-label={`${sv ? 'Välj kritfärg' : 'Valitse liidun väri'} ${color}`} aria-pressed={chalkColor === color} style={{ background: color }} onClick={() => { setChalkColor(color); setTool('chalk') }}/>) }
        </div>
        <button type="button" onClick={clearBoard}>{sv ? 'Rensa' : 'Tyhjennä'}</button>
      </div>
      <div className="chalk-pad">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          aria-label={sv ? 'Skrivyta. Rita med mus, touch eller penna.' : 'Kirjoitusalue. Piirrä hiirellä, kosketuksella tai kynällä.'}
        />
        <span className="chalk-pad-hint">{sv ? 'Skriv ditt svar, en böjningsform eller ett eget exempel här…' : 'Kirjoita vastaus, taivutus tai oma esimerkki tähän…'}</span>
      </div>
    </div>
  </section>
}

