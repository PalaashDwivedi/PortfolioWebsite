export default function HUD({ zone }) {
  const backHref = import.meta.env.PROD ? '../../Index.html' : '../Index.html'

  const zoneInfo = {
    TEMPLE: { label: 'Tech Temple',       color: '#9966ff', icon: '🔮' },
    FORGE:  { label: 'Game Forge',        color: '#ff6600', icon: '⚔️' },
    HUB:    { label: 'Central Hub',       color: '#44bb44', icon: '🌿' },
    ARENA:  { label: 'Achievement Arena', color: '#ffcc00', icon: '🏆' },
    TAVERN: { label: 'Quest Log Tavern',  color: '#cc8844', icon: '📜' },
  }
  const zi = zoneInfo[zone] || zoneInfo.HUB

  return (
    <>
      <a href={backHref} className="hud-back">← Portfolio</a>

      <div className="hud-zone" style={{ borderColor: zi.color }}>
        <span className="hud-zone-icon">{zi.icon}</span>
        <span className="hud-zone-name" style={{ color: zi.color }}>{zi.label}</span>
      </div>

      <div className="hud-controls">
        <span>WASD / ↑↓←→ Move</span>
        <span>E / Space Interact</span>
      </div>
    </>
  )
}
