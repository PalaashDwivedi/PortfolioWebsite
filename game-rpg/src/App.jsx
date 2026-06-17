import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import WorldScene from './game/WorldScene.js'
import DialogueBox from './components/DialogueBox.jsx'
import HUD from './components/HUD.jsx'
import { on, off } from './events.js'

export default function App() {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  const [ready,    setReady]    = useState(false)
  const [dialogue, setDialogue] = useState(null)
  const [zone,     setZone]     = useState('HUB')

  // ── Close dialogue ─────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setDialogue(null)
    const scene = gameRef.current?.scene?.getScene('WorldScene')
    if (scene) scene.dialogueOpen = false
  }, [])

  // ── Event wiring ───────────────────────────────────────────────────────────
  useEffect(() => {
    on('gameReady',    ()      => setReady(true))
    on('showDialogue', payload => setDialogue({ type: payload.type, data: payload.data }))
    on('zoneChange',   payload => setZone(payload.zone))
    return () => { off('gameReady'); off('showDialogue'); off('zoneChange') }
  }, [])

  // ── Phaser init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth, height: window.innerHeight,
      backgroundColor: '#100e0c',
      parent: containerRef.current,
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [WorldScene],
    }
    gameRef.current = new Phaser.Game(config)
    const onResize = () => gameRef.current?.scale.resize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && dialogue) handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialogue, handleClose])

  return (
    <div id="game-root">
      <div ref={containerRef} id="phaser-container" />

      {!ready && (
        <div className="loading-veil">
          <div className="loading-content">
            <div className="loading-spinner" />
            <p className="loading-text">Loading Developer's Realm...</p>
          </div>
        </div>
      )}

      {ready && <HUD zone={zone} />}

      {dialogue && (
        <DialogueBox type={dialogue.type} data={dialogue.data} onClose={handleClose} />
      )}
    </div>
  )
}
