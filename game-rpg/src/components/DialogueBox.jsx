// ─── Theme: dialogue type → overlay tint ──────────────────────────────────────
function getTheme(type) {
  switch (type) {
    case 'project':    return 'forge'
    case 'skill':      return 'temple'
    case 'cert':       return 'arena'
    case 'experience':
    case 'education':  return 'tavern'
    case 'about':      return 'hub'
    default:           return 'hub'
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// FORGE FURNACE — ProjectDialogue
// Trapezoid clip-path body + animated CSS flames + metal grate divider
// ═══════════════════════════════════════════════════════════════════════════════
const FLAMES = [
  { l:'4%',  w:18, h:32, dur:'0.88s', delay:'0.00s', r1:'-4deg', r2:' 3deg' },
  { l:'14%', w:24, h:48, dur:'0.72s', delay:'0.12s', r1:' 2deg', r2:'-5deg' },
  { l:'26%', w:20, h:56, dur:'0.96s', delay:'0.22s', r1:'-3deg', r2:' 4deg' },
  { l:'38%', w:28, h:42, dur:'0.80s', delay:'0.08s', r1:' 3deg', r2:'-4deg' },
  { l:'51%', w:22, h:52, dur:'0.91s', delay:'0.30s', r1:'-2deg', r2:' 5deg' },
  { l:'64%', w:26, h:38, dur:'0.76s', delay:'0.16s', r1:' 4deg', r2:'-3deg' },
  { l:'77%', w:18, h:48, dur:'0.84s', delay:'0.26s', r1:'-3deg', r2:' 2deg' },
  { l:'88%', w:20, h:34, dur:'0.68s', delay:'0.36s', r1:' 2deg', r2:'-4deg' },
]

function ProjectDialogue({ data, onClose }) {
  return (
    <div className="frg-glow">
      <div className="frg-body">

        {/* Fire chamber — flames + grate */}
        <div className="frg-chamber">
          <div className="frg-fire-bg" />
          {FLAMES.map((f, i) => (
            <span key={i} className="frg-flame" style={{
              left: f.l, width: f.w+'px', height: f.h+'px',
              '--fd': f.dur, '--fr1': f.r1, '--fr2': f.r2,
              animationDelay: f.delay,
            }} />
          ))}
          <div className="frg-grate" />
        </div>

        {/* Forge title bar */}
        <div className="frg-title-row">
          <span className="frg-num" style={{ color: data.accentHex }}>{data.number}</span>
          <h2 className="frg-title">{data.title}</h2>
        </div>

        {/* Scrollable content */}
        <div className="frg-scroll">
          {data.image && (
            <div className="frg-img-wrap">
              <img src={data.image} alt={data.title} className="frg-img" />
            </div>
          )}
          <p className="frg-desc">{data.description}</p>
          <div className="frg-tags">
            {data.tags?.map(t => (
              <span key={t} className="frg-tag" style={{ borderColor: data.accentHex, color: data.accentHex }}>{t}</span>
            ))}
          </div>
          {data.links?.filter(l => l.url).length > 0 && (
            <div className="frg-links">
              {data.links.filter(l => l.url).map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                   className="frg-link" style={{ background: data.accentHex }}>{l.label}</a>
              ))}
            </div>
          )}
        </div>

        <div className="frg-footer">
          <button className="frg-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPLAY CASE — CertDialogue
// Ornate multi-ring gold frame + spotlight sweep + twinkling sparkles
// ═══════════════════════════════════════════════════════════════════════════════
const SPARKLES = [
  { x:' -6px', y:' 10%', dur:'1.4s', d:'0.0s' }, { x:'101%',  y:'  8%', dur:'1.8s', d:'0.3s' },
  { x:' -5px', y:' 80%', dur:'1.6s', d:'0.6s' }, { x:'100%',  y:' 78%', dur:'2.0s', d:'0.1s' },
  { x:'  22%', y:' -5px', dur:'1.5s', d:'0.8s' }, { x:' 72%', y:' -5px', dur:'1.7s', d:'0.4s' },
  { x:'  28%', y:'103%',  dur:'1.9s', d:'0.7s' }, { x:' 68%', y:'102%',  dur:'1.3s', d:'0.2s' },
]

function CertDialogue({ data, onClose }) {
  return (
    <div className="arc-wrap">
      {/* Twinkling sparkles around the frame perimeter */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="arc-sparkle" style={{ left: s.x, top: s.y, '--sd': s.dur, '--sdelay': s.d }} />
      ))}

      <div className="arc-case">
        {/* Animated spotlight beam */}
        <div className="arc-spotlight" />

        {/* Gold corner ornaments */}
        <span className="arc-corner arc-corner--tl" />
        <span className="arc-corner arc-corner--tr" />
        <span className="arc-corner arc-corner--bl" />
        <span className="arc-corner arc-corner--br" />

        {/* Plaque header */}
        <div className="arc-header" style={{ borderColor: data.colorHex }}>
          {data.isAward && <span className="arc-award">🏆 Award</span>}
          <h2 className="arc-title" style={{ color: data.colorHex }}>{data.title}</h2>
          <div className="arc-meta">
            <span>{data.org}</span>
            <span className="arc-year">{data.year}</span>
          </div>
        </div>

        {/* Content */}
        <div className="arc-body">
          {data.image && (
            <div className="arc-img-wrap">
              <img src={data.image} alt={data.title} className="arc-img" />
            </div>
          )}
          <p className="arc-desc">{data.description}</p>
        </div>

        <div className="arc-footer">
          <button className="arc-btn" style={{ background: data.colorHex }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STONE TABLET — SkillDialogue
// Irregular rocky clip-path edges + glowing animated rune dividers + wisps
// ═══════════════════════════════════════════════════════════════════════════════
function RuneRow({ reverse }) {
  return (
    <div className={`tpl-rune-row${reverse ? ' tpl-rune-row--rev' : ''}`}>
      <span className="tpl-rune-glyph">ᚱ</span>
      <span className="tpl-rune-glyph">᛭</span>
      <span className="tpl-rune-glyph">ᚦ</span>
    </div>
  )
}

function SkillDialogue({ data, onClose }) {
  return (
    <div className="tpl-glow">
      {/* Wisps float outside the clipped stone */}
      <span className="tpl-wisp tpl-wisp--1" />
      <span className="tpl-wisp tpl-wisp--2" />
      <span className="tpl-wisp tpl-wisp--3" />
      <span className="tpl-wisp tpl-wisp--4" />

      <div className="tpl-stone">
        <div className="tpl-scroll">
          <RuneRow />

          <div className="tpl-header">
            <span className="tpl-icon">{data.icon}</span>
            <h2 className="tpl-cat" style={{ color: data.colorHex }}>{data.category}</h2>
          </div>

          <ul className="tpl-list">
            {data.items?.map(item => (
              <li key={item} className="tpl-item">
                <span className="tpl-bullet" style={{ color: data.colorHex }}>▸</span>
                <span className="tpl-item-text">{item}</span>
              </li>
            ))}
          </ul>

          <RuneRow reverse />

          <div className="tpl-footer">
            <button className="tpl-btn" style={{ background: data.colorHex }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARCHMENT SCROLL — ExperienceDialogue & EducationDialogue
// Three-part layout: cylindrical roll top + paper body + cylindrical roll bottom
// Candle lanterns positioned left and right of the scroll
// ═══════════════════════════════════════════════════════════════════════════════
function Candle() {
  return (
    <div className="tvr-candle">
      <div className="tvr-flame" />
      <div className="tvr-wick" />
      <div className="tvr-wax" />
      <div className="tvr-flame-glow" />
    </div>
  )
}

function ParchmentScroll({ children }) {
  return (
    <div className="tvr-outer">
      <Candle />
      <div className="tvr-scroll-col">
        <div className="tvr-roll tvr-roll--top" />
        <div className="tvr-paper">{children}</div>
        <div className="tvr-roll tvr-roll--bot" />
      </div>
      <Candle />
    </div>
  )
}

function ExperienceDialogue({ data, onClose }) {
  return (
    <ParchmentScroll>
      <div className="tvr-header">
        <h2 className="tvr-title">{data.title}</h2>
        <a href={data.companyUrl} target="_blank" rel="noreferrer" className="tvr-company">{data.company}</a>
        <span className="tvr-period">{data.period}</span>
      </div>
      <div className="tvr-body">
        <p className="tvr-desc">{data.description}</p>
        <ul className="tvr-highlights">
          {data.highlights?.map((h, i) => (
            <li key={i} className="tvr-highlight">
              <span className="tvr-bullet">◆</span>{h}
            </li>
          ))}
        </ul>
      </div>
      <div className="tvr-footer">
        <button className="tvr-btn" onClick={onClose}>Close</button>
      </div>
    </ParchmentScroll>
  )
}

function EducationDialogue({ data, onClose }) {
  return (
    <ParchmentScroll>
      <div className="tvr-header">
        <h2 className="tvr-title">{data.degree}</h2>
        <span className="tvr-company">{data.institution}</span>
        <span className="tvr-period">{data.period}</span>
      </div>
      <div className="tvr-body">
        <p className="tvr-focus">{data.focus}</p>
        <div className="tvr-gpa-grid">
          {data.gpa?.map(g => (
            <div key={g.sem} className="tvr-gpa-item">
              <span className="tvr-gpa-sem">{g.sem}</span>
              <span className="tvr-gpa-score">{g.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="tvr-footer">
        <button className="tvr-btn" onClick={onClose}>Close</button>
      </div>
    </ParchmentScroll>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO CODEX — AboutDialogue
// Leather-bound codex look: ornamental banner with PD sigil + glowing border
// ═══════════════════════════════════════════════════════════════════════════════
function AboutDialogue({ data, onClose }) {
  return (
    <div className="hub-card">
      {/* Pulsing border glow layer */}
      <div className="hub-border-pulse" aria-hidden="true" />

      {/* Ornamental top banner with initials sigil */}
      <div className="hub-banner">
        <span className="hub-gem">◈</span>
        <div className="hub-sigil-wrap">
          <span className="hub-sigil-ring" />
          <span className="hub-initials">P D</span>
        </div>
        <span className="hub-gem">◈</span>
      </div>

      {/* Profile row */}
      <div className="hub-profile">
        {data.photo && <img src={data.photo} alt={data.name} className="hub-photo" />}
        <div>
          <h2 className="hub-name">{data.name}</h2>
          <p className="hub-role">{data.role}</p>
        </div>
      </div>

      <div className="hub-divider"><span>✦</span></div>

      {/* Bio + contacts */}
      <div className="hub-body">
        <p className="hub-bio">{data.bio}</p>
        <div className="hub-contacts">
          {data.contact?.email    && <a href={`mailto:${data.contact.email}`} className="hub-link">✉ {data.contact.email}</a>}
          {data.contact?.linkedin && <a href={data.contact.linkedin} target="_blank" rel="noreferrer" className="hub-link">🔗 LinkedIn</a>}
          {data.contact?.itch     && <a href={data.contact.itch}     target="_blank" rel="noreferrer" className="hub-link">🎮 itch.io</a>}
          {data.contact?.youtube  && <a href={data.contact.youtube}  target="_blank" rel="noreferrer" className="hub-link">▶ YouTube</a>}
        </div>
      </div>

      {/* Ornamental bottom bar with close */}
      <div className="hub-bottom-bar">
        <span className="hub-gem">◈</span>
        <button className="hub-close-btn" onClick={onClose}>Close</button>
        <span className="hub-gem">◈</span>
      </div>
    </div>
  )
}

// ─── Main DialogueBox ──────────────────────────────────────────────────────────
// NPC dialogue is handled in Phaser (speech bubbles). This component only
// renders themed cards for content-type interactions: projects, skills,
// certificates, about, experience, and education.
export default function DialogueBox({ type, data, onClose }) {
  if (!data) return null
  const theme = getTheme(type)

  const popup = (() => {
    switch (type) {
      case 'project':    return <ProjectDialogue    data={data} onClose={onClose} />
      case 'skill':      return <SkillDialogue      data={data} onClose={onClose} />
      case 'cert':       return <CertDialogue       data={data} onClose={onClose} />
      case 'about':      return <AboutDialogue      data={data} onClose={onClose} />
      case 'experience': return <ExperienceDialogue data={data} onClose={onClose} />
      case 'education':  return <EducationDialogue  data={data} onClose={onClose} />
      default:           return null
    }
  })()

  return (
    <div className={`dlg-overlay dlg-overlay--${theme}`}
         onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {popup}
    </div>
  )
}
