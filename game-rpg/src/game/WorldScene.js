import Phaser from 'phaser'
import { emit } from '../events.js'
import { PROJECTS, SKILLS_DATA, CERTIFICATES, ABOUT } from '../data.js'

// â”€â”€â”€ World constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WORLD_W  = 3600
const WORLD_H  = 3600
const ZONE_W   = 1200
const ZONE_H   = 1200
const TILE     = 40
const SPEED    = 190

// Hub-and-spoke layout: HUB at center, 4 rooms in cardinal directions
// Zone top-left corners
const ZX = { TEMPLE: 1200, FORGE: 0,    HUB: 1200, ARENA: 2400, TAVERN: 1200 }
const ZY = { TEMPLE: 0,    FORGE: 1200, HUB: 1200, ARENA: 1200, TAVERN: 2400 }

// Side doors: vertical walls at x=1200 and x=2400, gap in Y (FORGE â†” HUB â†” ARENA)
const SIDE_DOOR_T = 1550   // gap starts at y=1550
const SIDE_DOOR_B = 2050   // gap ends   at y=2050

// Top/bottom doors: horizontal walls at y=1200 and y=2400, gap in X (TEMPLE â†” HUB â†” TAVERN)
const HORIZ_DOOR_L = 1550  // gap starts at x=1550
const HORIZ_DOOR_R = 2050  // gap ends   at x=2050

// Colour palette
const C = {
  // Temple â€” deep indigo
  templeDark: 0x0d0028, templeLight: 0x160040,
  templeWall: 0x08001a, templeAccent: 0x6633cc,
  // Forge â€” volcanic red
  forgeDark: 0x2a0800, forgeLight: 0x3d1000,
  forgeWall: 0x1a0400, forgeFire: 0xff4400,
  // Hub â€” lush green
  hubDark: 0x0d2200, hubLight: 0x163300,
  hubWall: 0x0a1a00, hubPath: 0x3d3020,
  // Arena â€” midnight blue / gold
  arenaDark: 0x00091a, arenaLight: 0x000d26,
  arenaWall: 0x000614, arenaGold: 0xc8a000,
  // Tavern â€” warm wood
  tavernDark: 0x2a1400, tavernLight: 0x3d1e00,
  tavernWall: 0x1a0d00, tavernWood: 0x5a3010,
  // Corner walls (inaccessible)
  cornerDark: 0x080808, cornerMid: 0x111111,
  // Shared
  doorFrame: 0x665533,
  text: 0xffffff,
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
    this.playerSpeed = SPEED
    this.nearestObj  = null
    this.interactables = []
    this.dialogueOpen  = false
    this._speechBubble = null   // active in-world NPC speech bubble
    this.promptText    = null
    this.currentZone   = 'HUB'
    this._gatewayDefs  = []
    this._gwState      = {}
  }

  // â”€â”€â”€ Texture generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  preload() {
    this._makePlayerSheet()
    this._makeNPCTex()
    this._makeParticleTex()
    this._makeOrbTex()
    this._makeCrystalTex()
    this._makeTrophyTex()
    this._makeChestTex()
  }

  _makePlayerSheet() {
    // 4 frames Ã— 24 px wide = 96 wide, 34 tall
    // Frame 0: idle  Frame 1: walk-A (left foot fwd)
    // Frame 2: walk-mid (legs cross)  Frame 3: walk-B (right foot fwd)
    const g = this.make.graphics({ x: 0, y: 0, add: false })

    const drawAt = (ox, { legL, legR, shoeL, shoeR, armL, armR, by }) => {
      g.fillStyle(0x223366)
      g.fillRect(ox + legL[0],  legL[1],  legL[2],  legL[3])
      g.fillRect(ox + legR[0],  legR[1],  legR[2],  legR[3])
      g.fillStyle(0x111111)
      g.fillRect(ox + shoeL[0], shoeL[1], shoeL[2], shoeL[3])
      g.fillRect(ox + shoeR[0], shoeR[1], shoeR[2], shoeR[3])
      g.fillStyle(0x3366cc)
      g.fillRect(ox + armL[0],  armL[1],  armL[2],  armL[3])
      g.fillRect(ox + armR[0],  armR[1],  armR[2],  armR[3])
      g.fillRect(ox + 2, by, 20, 12)
      g.fillStyle(0x4477dd); g.fillRect(ox + 8, by, 8, 2)
      g.fillStyle(0xf5c5a3); g.fillRect(ox + 5, 3, 14, 10)
      g.fillStyle(0x221100); g.fillRect(ox + 4, 1, 16, 5)
      g.fillStyle(0x000000); g.fillRect(ox + 7, 7, 3, 2); g.fillRect(ox + 14, 7, 3, 2)
    }

    // Frame 0 â€” idle
    drawAt(0, {
      legL: [3,22,8,10], legR: [13,22,8,10],
      shoeL:[2,30,9,4],  shoeR:[12,30,9,4],
      armL: [-2,12,5,10],armR: [21,12,5,10], by:12,
    })
    // Frame 1 â€” walk-A: left foot forward, right foot back, body bobs up
    drawAt(24, {
      legL: [2,20,8,11], legR: [14,24,8,8],
      shoeL:[0,29,10,4], shoeR:[13,30,9,4],
      armL: [-3,13,5,9], armR: [21,11,5,9],  by:11,
    })
    // Frame 2 â€” walk-mid: legs cross, body dips
    drawAt(48, {
      legL: [4,23,7,9],  legR: [13,23,7,9],
      shoeL:[3,30,8,4],  shoeR:[13,30,8,4],
      armL: [-2,13,5,9], armR: [21,13,5,9],  by:13,
    })
    // Frame 3 â€” walk-B: right foot forward, left foot back, body bobs up
    drawAt(72, {
      legL: [2,24,8,8],  legR: [14,20,8,11],
      shoeL:[2,30,9,4],  shoeR:[15,29,10,4],
      armL: [-3,11,5,9], armR: [22,13,5,9],  by:11,
    })

    g.generateTexture('player', 96, 34)
    g.destroy()

    // Register individual frames on the texture so Phaser anims can reference them
    const tex = this.textures.get('player')
    for (let i = 0; i < 4; i++) tex.add(i, 0, i * 24, 0, 24, 34)
  }

  _makeNPCTex() {
    const colors = {
      sage:    { robe: 0x5522aa, skin: 0xf0c880, hair: 0xeeeeee, trim: 0xaa88ff },
      smith:   { robe: 0x883300, skin: 0xc09060, hair: 0x221100, trim: 0xff6600 },
      guide:   { robe: 0x226622, skin: 0xf5c5a3, hair: 0x443300, trim: 0x66ff66 },
      herald:  { robe: 0x996600, skin: 0xf5c5a3, hair: 0x442200, trim: 0xffd700 },
      barkeep: { robe: 0x4a2800, skin: 0xc09060, hair: 0x330000, trim: 0x884400 },
    }
    Object.entries(colors).forEach(([name, c]) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(c.robe); g.fillRect(2,12,20,14); g.fillRect(0,12,4,10); g.fillRect(20,12,4,10)
      g.fillStyle(c.trim); g.fillRect(2,12,20,2); g.fillRect(9,24,6,2)
      g.fillStyle(c.skin); g.fillRect(5,3,14,10)
      g.fillStyle(c.hair); g.fillRect(4,1,16,5)
      g.fillStyle(0x000000); g.fillRect(7,7,3,2); g.fillRect(14,7,3,2)
      g.fillStyle(0x000000); g.fillRect(8,11,8,1)
      g.generateTexture(`npc_${name}`, 24, 26)
      g.destroy()
    })
  }

  _makeParticleTex() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff); g.fillCircle(4, 4, 4)
    g.generateTexture('particle', 8, 8)
    g.destroy()
  }

  _makeOrbTex() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff, 0.9); g.fillCircle(20, 20, 20)
    g.fillStyle(0xffffff, 0.5); g.fillCircle(14, 14, 8)
    g.generateTexture('orb', 40, 40)
    g.destroy()
  }

  _makeCrystalTex() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff, 0.9)
    g.beginPath()
    g.moveTo(16,0); g.lineTo(28,10); g.lineTo(28,38); g.lineTo(16,48); g.lineTo(4,38); g.lineTo(4,10)
    g.closePath(); g.fillPath()
    g.fillStyle(0xffffff, 0.4)
    g.beginPath()
    g.moveTo(10,6); g.lineTo(18,12); g.lineTo(12,28); g.lineTo(6,18)
    g.closePath(); g.fillPath()
    g.generateTexture('crystal', 32, 48)
    g.destroy()
  }

  _makeTrophyTex() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffd700); g.fillRect(8,2,28,24)
    g.fillStyle(0xffaa00); g.fillRect(8,2,4,24); g.fillRect(32,2,4,24)
    g.fillStyle(0xffd700); g.fillRect(2,6,8,12); g.fillRect(34,6,8,12)
    g.fillStyle(0xcc8800); g.fillRect(18,26,8,10); g.fillRect(10,36,24,6)
    g.fillStyle(0xffffff, 0.6); g.fillTriangle(22,4,26,14,18,14)
    g.generateTexture('trophy', 44, 44)
    g.destroy()
  }

  _makeChestTex() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x664400); g.fillRect(0,8,40,28)
    g.fillStyle(0x442200); g.fillRect(0,8,40,5)
    g.fillStyle(0xccaa00); g.fillRect(14,17,12,8); g.fillRect(0,6,40,4)
    g.fillStyle(0xffdd00); g.fillRect(16,20,8,4); g.fillRect(2,7,36,2)
    g.generateTexture('chest', 40, 36)
    g.destroy()
  }

  // â”€â”€â”€ Scene create â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  create() {
    try {
      this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H)
      this._buildWorld()
      this._buildWalls()
      this._createPlayer()
      this._createNPCs()
      this._createInteractables()
      this._setupInput()
      this._setupCamera()
      this._createHUD()
      this._setupGateways()
    } catch (err) {
      console.error('[WorldScene] create() error:', err)
    } finally {
      emit('gameReady', null)
    }
  }

  // â”€â”€â”€ World building â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildWorld() {
    // Dungeon stone base for the whole void, then zone floors on top
    this._drawDungeonBackground()
    this._drawCorners()

    // Draw themed zone floors
    this._drawTempleFloor()
    this._drawForgeFloor()
    this._drawHubFloor()
    this._drawArenaFloor()
    this._drawTavernFloor()

    // Build zone decorations
    this._buildTemple()
    this._buildForge()
    this._buildHub()
    this._buildArena()
    this._buildTavern()

    // Doorways and labels
    this._drawDoorways()
    this._drawZoneLabels()
  }

  // â”€â”€â”€ Dungeon stone background (drawn first, under everything) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _drawDungeonBackground() {
    // Brick dimensions
    const BW = 78, BH = 34, MORTAR = 5
    const STEP_X = BW + MORTAR
    const STEP_Y = BH + MORTAR
    // Only draw in the 4 corner areas â€” zone floors cover the rest
    const corners = [[0, 0], [2400, 0], [0, 2400], [2400, 2400]]
    const brickColors = [0x2c2421, 0x272220, 0x302826, 0x231f1d, 0x2a211f]
    const g = this.add.graphics().setDepth(-10)

    // Mortar base fill
    g.fillStyle(0x120f0d)
    corners.forEach(([cx, cy]) => g.fillRect(cx, cy, ZONE_W, ZONE_H))

    corners.forEach(([cx, cy]) => {
      for (let row = 0; row * STEP_Y < ZONE_H + BH; row++) {
        const ty = cy + row * STEP_Y
        const offset = (row % 2) * Math.round(STEP_X / 2)
        for (let col = -1; col * STEP_X - offset < ZONE_W + BW; col++) {
          const tx = cx + col * STEP_X - offset
          // visible portion inside this corner zone
          const bx = Math.max(tx, cx)
          const by = Math.max(ty, cy)
          const bw = Math.min(tx + BW, cx + ZONE_W) - bx
          const bh = Math.min(ty + BH, cy + ZONE_H) - by
          if (bw <= 0 || bh <= 0) continue

          // Brick body â€” subtle colour variation per position
          const idx = ((row * 3) + (Math.abs(col) * 7)) % brickColors.length
          g.fillStyle(brickColors[idx])
          g.fillRect(bx, by, bw, bh)

          // Top-edge highlight (lighter strip)
          if (by <= ty + 1) {
            g.fillStyle(0x373230)
            g.fillRect(bx, by, bw, Math.min(2, bh))
          }
          // Bottom-edge shadow
          if (by + bh >= ty + BH - 1) {
            g.fillStyle(0x0d0b09)
            g.fillRect(bx, by + bh - Math.min(2, bh), bw, Math.min(2, bh))
          }
          // Left-edge shadow
          if (bx <= tx + 1) {
            g.fillStyle(0x1a1816)
            g.fillRect(bx, by, Math.min(3, bw), bh)
          }
        }
      }
    })
  }

  _drawCorners() {
    const corners = [[0, 0], [2400, 0], [0, 2400], [2400, 2400]]

    corners.forEach(([cx, cy]) => {
      const g  = this.add.graphics().setDepth(-8)
      const g2 = this.add.graphics().setDepth(-7)

      // â”€â”€ Subtle darkening overlay so corners feel heavier than open zones â”€â”€
      g.fillStyle(0x070605)
      for (let tx = cx; tx < cx + ZONE_W; tx += TILE * 3) {
        for (let ty = cy; ty < cy + ZONE_H; ty += TILE * 3) {
          g.fillRect(tx, ty, TILE * 3, TILE * 3)
        }
      }

      // â”€â”€ Iron grating bars (vertical + horizontal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      g2.fillStyle(0x1c1c26)
      // Vertical bars
      for (let bx = cx + 100; bx < cx + ZONE_W - 80; bx += 90) {
        g2.fillRect(bx, cy + 50, 7, ZONE_H - 100)
        // shine
        g2.fillStyle(0x28283a)
        g2.fillRect(bx + 2, cy + 50, 2, ZONE_H - 100)
        g2.fillStyle(0x1c1c26)
      }
      // Horizontal cross-bars (3 evenly spaced)
      for (let by = cy + 250; by < cy + ZONE_H - 100; by += 330) {
        g2.fillStyle(0x1c1c26)
        g2.fillRect(cx + 100, by, ZONE_W - 180, 7)
        g2.fillStyle(0x24243a)
        g2.fillRect(cx + 100, by + 2, ZONE_W - 180, 2)
      }
      // Bolt knobs at bar intersections
      g2.fillStyle(0x2a2a3a)
      for (let bx = cx + 100; bx < cx + ZONE_W - 80; bx += 90) {
        for (let by = cy + 250; by < cy + ZONE_H - 100; by += 330) {
          g2.fillCircle(bx + 3, by + 3, 5)
        }
      }

      // â”€â”€ Cracks in the stone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const cg = this.add.graphics().setDepth(-6)
      cg.lineStyle(1, 0x080604)
      ;[
        [cx+160, cy+110, cx+195, cy+180], [cx+195, cy+180, cx+185, cy+250],
        [cx+480, cy+70,  cx+450, cy+170], [cx+450, cy+170, cx+460, cy+240],
        [cx+780, cy+190, cx+810, cy+295], [cx+810, cy+295, cx+800, cy+340],
        [cx+1020,cy+140, cx+990, cy+250],
        [cx+110, cy+480, cx+155, cy+600], [cx+155, cy+600, cx+140, cy+660],
        [cx+920, cy+520, cx+890, cy+640],
        [cx+520, cy+720, cx+545, cy+860],
        [cx+190, cy+930, cx+220, cy+1060],
        [cx+840, cy+910, cx+810, cy+1040],
        [cx+1060,cy+760, cx+1030,cy+890],
      ].forEach(([x1,y1,x2,y2]) => {
        cg.lineBetween(x1, y1, x2, y2)
        cg.lineBetween(x1+1, y1, x2+1, y2) // doubled for visibility
      })

      // â”€â”€ Moss / mould patches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const mg = this.add.graphics().setDepth(-6)
      ;[
        [cx+80,  cy+45,  17], [cx+390, cy+95,  13],
        [cx+720, cy+55,  15], [cx+1010,cy+85,  19],
        [cx+45,  cy+360, 14], [cx+1110,cy+430, 16],
        [cx+270, cy+860, 12], [cx+770, cy+970, 18],
        [cx+55,  cy+1060,13], [cx+960, cy+1110,15],
        [cx+550, cy+400, 11], [cx+430, cy+700, 14],
      ].forEach(([mx, my, mr]) => {
        mg.fillStyle(0x18300a)
        mg.fillCircle(mx, my, mr)
        mg.fillStyle(0x233d0c)
        mg.fillCircle(mx + 5, my - 4, Math.round(mr * 0.55))
        mg.fillStyle(0x122206)
        mg.fillCircle(mx - 4, my + 6, Math.round(mr * 0.4))
      })

      // â”€â”€ Wall torch at center of each corner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const tx = cx + ZONE_W / 2, ty = cy + ZONE_H / 2
      const tg = this.add.graphics().setDepth(-5)
      // Wall bracket
      tg.fillStyle(0x3a2a10)
      tg.fillRect(tx - 4, ty - 2, 8, 28)       // stick
      tg.fillStyle(0x4a3a18)
      tg.fillRect(tx - 7, ty - 8, 14, 9)        // bowl
      tg.fillStyle(0x5a4a22)
      tg.fillRect(tx - 5, ty - 6, 10, 5)        // inner bowl
      // Flame
      tg.fillStyle(0xff6600)
      tg.fillCircle(tx, ty - 16, 9)
      tg.fillStyle(0xff9900)
      tg.fillCircle(tx, ty - 20, 6)
      tg.fillStyle(0xffdd00)
      tg.fillCircle(tx, ty - 24, 3)
      // Fire glow ring
      tg.lineStyle(8, 0xff5500, 0.12)
      tg.strokeCircle(tx, ty - 18, 22)
      // Fire particles
      this._spawnParticles(tx, ty - 20, 0xff7700, 1400, 14, 18, -55)
    })
  }

  _drawZoneFloor(zx, zy, zw, zh, c1, c2) {
    const g = this.add.graphics()
    for (let tx = zx; tx < zx + zw; tx += TILE) {
      for (let ty = zy; ty < zy + zh; ty += TILE) {
        const alt = ((tx - zx) / TILE + (ty - zy) / TILE) % 2 === 0
        g.fillStyle(alt ? c1 : c2)
        g.fillRect(tx, ty, TILE, TILE)
      }
    }
  }

  // â”€â”€ TEMPLE FLOOR â€” large stone slabs with inlaid arcane geometry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _drawTempleFloor() {
    const zx = ZX.TEMPLE, zy = ZY.TEMPLE
    const g = this.add.graphics()
    const FW = 96, FH = 96, GROUT = 5

    // Mortar base
    g.fillStyle(0x05020d)
    g.fillRect(zx, zy, ZONE_W, ZONE_H)

    // Large flag-stone slabs â€” dark indigo hues
    const slabs = [0x130b22, 0x0f081a, 0x16102a, 0x0d0619, 0x191230]
    for (let row = 0; row * (FH + GROUT) < ZONE_H; row++) {
      for (let col = 0; col * (FW + GROUT) < ZONE_W; col++) {
        const tx = zx + col * (FW + GROUT)
        const ty = zy + row * (FH + GROUT)
        const idx = (row * 3 + col * 7) % slabs.length
        g.fillStyle(slabs[idx])
        g.fillRect(tx, ty, FW, FH)
        // Chamfered edge highlight (top + left)
        g.fillStyle(0x1e1538)
        g.fillRect(tx, ty, FW, 2)
        g.fillRect(tx, ty, 2, FH)
        // Shadow (bottom + right)
        g.fillStyle(0x060311)
        g.fillRect(tx, ty + FH - 2, FW, 2)
        g.fillRect(tx + FW - 2, ty, 2, FH)
      }
    }

    // â”€â”€ Central arcane circle inlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const cx = zx + 600, cy = zy + 600
    ;[280, 200, 130, 70].forEach((r, i) => {
      g.lineStyle(i === 0 ? 3 : 2, 0x3322aa, 0.35 - i * 0.04)
      g.strokeCircle(cx, cy, r)
    })
    // 8 spokes radiating from center
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8
      g.lineStyle(1, 0x2a1888, 0.3)
      g.lineBetween(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70,
                    cx + Math.cos(a) * 280, cy + Math.sin(a) * 280)
    }
    // Rune triangle points around the outer ring
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6
      const rx = cx + Math.cos(a) * 240, ry = cy + Math.sin(a) * 240
      g.lineStyle(2, 0x221166, 0.4)
      g.strokeTriangle(rx, ry - 12, rx - 10, ry + 8, rx + 10, ry + 8)
    }

    // â”€â”€ Corner rune medallions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ;[[zx+140, zy+140], [zx+1060, zy+140], [zx+140, zy+1060], [zx+1060, zy+1060]].forEach(([rx, ry]) => {
      g.lineStyle(2, 0x221166, 0.45)
      g.strokeCircle(rx, ry, 55)
      g.strokeRect(rx - 38, ry - 38, 76, 76)
      g.lineBetween(rx - 55, ry, rx + 55, ry)
      g.lineBetween(rx, ry - 55, rx, ry + 55)
      g.lineStyle(1, 0x1a0e55, 0.35)
      g.strokeCircle(rx, ry, 30)
    })
  }

  // â”€â”€ FORGE FLOOR â€” sooty rough stone with heat stains and metal grating â”€â”€â”€â”€â”€
  _drawForgeFloor() {
    const zx = ZX.FORGE, zy = ZY.FORGE
    const g = this.add.graphics()
    const FW = 68, FH = 52, GROUT = 5

    // Mortar base (dark, gritty)
    g.fillStyle(0x0c0a08)
    g.fillRect(zx, zy, ZONE_W, ZONE_H)

    // Rough stone flags â€” worn grey-brown
    const stones = [0x1e1a16, 0x1a1612, 0x231f1b, 0x17140f, 0x201c18, 0x1c1814]
    for (let row = 0; row * (FH + GROUT) < ZONE_H; row++) {
      const offset = (row % 2) * Math.round((FW + GROUT) / 2)
      for (let col = -1; col * (FW + GROUT) - offset < ZONE_W + FW; col++) {
        const tx = zx + col * (FW + GROUT) - offset
        const ty = zy + row * (FH + GROUT)
        const bx = Math.max(tx, zx), by = Math.max(ty, zy)
        const bw = Math.min(tx + FW, zx + ZONE_W) - bx
        const bh = Math.min(ty + FH, zy + ZONE_H) - by
        if (bw <= 0 || bh <= 0) continue
        const idx = (row * 5 + Math.abs(col) * 3) % stones.length
        g.fillStyle(stones[idx])
        g.fillRect(bx, by, bw, bh)
        // Top highlight
        g.fillStyle(0x2a2622)
        g.fillRect(bx, by, bw, Math.min(2, bh))
        // Bottom shadow
        g.fillStyle(0x0a0806)
        g.fillRect(bx, by + bh - Math.min(2, bh), bw, Math.min(2, bh))
      }
    }

    // â”€â”€ Soot & heat stains around each furnace position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ;[[zx+200,zy+340],[zx+600,zy+340],[zx+1000,zy+340],
      [zx+200,zy+800],[zx+600,zy+800],[zx+1000,zy+800]].forEach(([fx, fy]) => {
      // Outer soot ring
      g.fillStyle(0x0a0806); g.fillCircle(fx, fy+20, 75)
      // Inner heat glow (dark ember red)
      g.fillStyle(0x160503); g.fillCircle(fx, fy+20, 44)
    })

    // â”€â”€ Metal grating section under the anvil â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ax = zx + 600, ay = zy + 545
    g.fillStyle(0x16141a)
    g.fillRect(ax - 90, ay - 55, 180, 110)
    g.lineStyle(2, 0x0a0a12)
    for (let lx = ax - 90; lx <= ax + 90; lx += 18) g.lineBetween(lx, ay - 55, lx, ay + 55)
    for (let ly = ay - 55; ly <= ay + 55; ly += 18) g.lineBetween(ax - 90, ly, ax + 90, ly)
    // Grate highlights
    g.lineStyle(1, 0x20201e)
    for (let lx = ax - 88; lx <= ax + 90; lx += 18) g.lineBetween(lx, ay - 55, lx, ay + 55)

    // â”€â”€ Coal/ash scatter marks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    g.fillStyle(0x090706)
    ;[[zx+120,zy+200],[zx+850,zy+180],[zx+400,zy+600],[zx+1050,zy+680],
      [zx+300,zy+950],[zx+750,zy+1050],[zx+100,zy+1100],[zx+1050,zy+1100]].forEach(([mx,my]) => {
      g.fillCircle(mx, my, 18 + (mx % 7))
    })
  }

  // â”€â”€ HUB FLOOR â€” cobblestone courtyard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _drawHubFloor() {
    const zx = ZX.HUB, zy = ZY.HUB
    const g = this.add.graphics()
    const CW = 38, CH = 38, GROUT = 4

    // Mortar base
    g.fillStyle(0x0c1808)
    g.fillRect(zx, zy, ZONE_W, ZONE_H)

    // Cobblestones â€” offset rows, dark earthy greens
    const cobbles = [0x1a3214, 0x162a10, 0x1e3818, 0x12260c, 0x203a16, 0x142e0e]
    for (let row = 0; row * (CH + GROUT) < ZONE_H; row++) {
      const offset = (row % 2) * Math.round((CW + GROUT) / 2)
      for (let col = -1; col * (CW + GROUT) - offset < ZONE_W + CW; col++) {
        const tx = zx + col * (CW + GROUT) - offset
        const ty = zy + row * (CH + GROUT)
        const bx = Math.max(tx, zx), by = Math.max(ty, zy)
        const bw = Math.min(tx + CW, zx + ZONE_W) - bx
        const bh = Math.min(ty + CH, zy + ZONE_H) - by
        if (bw <= 0 || bh <= 0) continue
        const idx = (row * 7 + Math.abs(col) * 3) % cobbles.length
        g.fillStyle(cobbles[idx])
        g.fillRect(bx, by, bw, bh)
        // Corner chamfers (darkens corners to give rounded stone illusion)
        g.fillStyle(0x0a1406)
        if (bw >= 4 && bh >= 4) {
          g.fillRect(bx, by, 3, 3)
          g.fillRect(bx + bw - 3, by, 3, 3)
          g.fillRect(bx, by + bh - 3, 3, 3)
          g.fillRect(bx + bw - 3, by + bh - 3, 3, 3)
        }
        // Top highlight
        g.fillStyle(0x253c18)
        g.fillRect(bx, by, bw, Math.min(2, bh))
      }
    }
  }

  // â”€â”€ ARENA FLOOR â€” polished marble with central combat ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _drawArenaFloor() {
    const zx = ZX.ARENA, zy = ZY.ARENA
    const g = this.add.graphics()
    const TW = 84, TH = 84, GROUT = 4

    // Grout base â€” dark slate blue
    g.fillStyle(0x07101e)
    g.fillRect(zx, zy, ZONE_W, ZONE_H)

    // Polished marble tiles â€” cool blue-grey tones
    const marble = [0x0d1828, 0x0a1422, 0x10202e, 0x0b1626, 0x0f1c2c, 0x0c1a2a]
    for (let row = 0; row * (TH + GROUT) < ZONE_H; row++) {
      for (let col = 0; col * (TW + GROUT) < ZONE_W; col++) {
        const tx = zx + col * (TW + GROUT)
        const ty = zy + row * (TH + GROUT)
        const bw = Math.min(TW, zx + ZONE_W - tx)
        const bh = Math.min(TH, zy + ZONE_H - ty)
        if (bw <= 0 || bh <= 0) continue
        const idx = (row + col) % marble.length
        g.fillStyle(marble[idx])
        g.fillRect(tx, ty, bw, bh)
        // Marble vein (thin diagonal line on some tiles)
        if ((row * 3 + col * 5) % 7 === 0) {
          g.lineStyle(1, 0x18304a, 0.7)
          g.lineBetween(tx + 8, ty + 8, tx + bw - 8, ty + bh - 8)
        }
        // Polished sheen (top-left highlight)
        g.fillStyle(0x162638)
        g.fillRect(tx, ty, bw, 2)
        g.fillRect(tx, ty, 2, bh)
        // Shadow edge
        g.fillStyle(0x060e18)
        g.fillRect(tx, ty + bh - 2, bw, 2)
      }
    }

    // â”€â”€ Central combat ring â€” dark sand pit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const cx = zx + 600, cy = zy + 600
    // Outer sand ring
    g.fillStyle(0x14100a); g.fillCircle(cx, cy, 240)
    // Inner sand floor
    g.fillStyle(0x1c1608); g.fillCircle(cx, cy, 220)
    g.fillStyle(0x1a1408); g.fillCircle(cx, cy, 180)
    // Gold ring borders
    g.lineStyle(4, C.arenaGold, 0.7); g.strokeCircle(cx, cy, 240)
    g.lineStyle(2, C.arenaGold, 0.4); g.strokeCircle(cx, cy, 200)
    g.lineStyle(1, C.arenaGold, 0.25); g.strokeCircle(cx, cy, 155)
    // 4 cardinal marks on the ring
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2
      const mx = cx + Math.cos(a) * 240, my = cy + Math.sin(a) * 240
      g.fillStyle(C.arenaGold); g.fillRect(mx - 5, my - 5, 10, 10)
    }
    // Decorative outer border frame (gold inlay)
    g.lineStyle(3, 0x664400, 0.5)
    g.strokeRect(zx + 28, zy + 28, ZONE_W - 56, ZONE_H - 56)
    g.lineStyle(1, 0x442e00, 0.4)
    g.strokeRect(zx + 40, zy + 40, ZONE_W - 80, ZONE_H - 80)
  }

  // â”€â”€ TAVERN FLOOR â€” wood planks with flagstone entry and central rug â”€â”€â”€â”€â”€â”€â”€â”€
  _drawTavernFloor() {
    const zx = ZX.TAVERN, zy = ZY.TAVERN
    const g = this.add.graphics()
    const PH = 30, GAP = 3   // plank height, gap between planks

    // â”€â”€ Wood plank boards (horizontal, full width) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    g.fillStyle(0x0e0702)
    g.fillRect(zx, zy, ZONE_W, ZONE_H)

    const planks = [0x2e1807, 0x281405, 0x341c08, 0x221205, 0x381f09, 0x241006]
    for (let row = 0; row * (PH + GAP) < ZONE_H; row++) {
      const py = zy + row * (PH + GAP)
      const ph = Math.min(PH, zy + ZONE_H - py)
      if (ph <= 0) continue
      // Main plank body
      g.fillStyle(planks[row % planks.length])
      g.fillRect(zx, py, ZONE_W, ph)
      // Top grain highlight
      g.fillStyle(0x3e2209)
      g.fillRect(zx, py, ZONE_W, Math.min(2, ph))
      // Bottom shadow
      g.fillStyle(0x160902)
      g.fillRect(zx, py + ph - Math.min(3, ph), ZONE_W, Math.min(3, ph))
      // Plank joints â€” vertical breaks, staggered every ~180px per row
      const jointOff = (row % 4) * 45
      for (let jx = zx + jointOff; jx < zx + ZONE_W; jx += 180) {
        g.fillStyle(0x110701)
        g.fillRect(jx, py, 2, ph)
      }
    }

    // â”€â”€ Stone flagging at the entrance (top strip, ~110px, near the door) â”€â”€â”€â”€â”€
    const flagW = 100, flagH = 44, flagGrout = 5
    g.fillStyle(0x141210)
    g.fillRect(zx, zy, ZONE_W, 115)
    const flagStones = [0x201c18, 0x1c1814, 0x242018, 0x181412]
    for (let row = 0; row * (flagH + flagGrout) < 115; row++) {
      const offset = (row % 2) * Math.round((flagW + flagGrout) / 2)
      for (let col = -1; col * (flagW + flagGrout) - offset < ZONE_W + flagW; col++) {
        const tx = zx + col * (flagW + flagGrout) - offset
        const ty = zy + row * (flagH + flagGrout)
        const bx = Math.max(tx, zx), by = Math.max(ty, zy)
        const bw = Math.min(tx + flagW, zx + ZONE_W) - bx
        const bh = Math.min(ty + flagH, zy + 115) - by
        if (bw <= 0 || bh <= 0) continue
        g.fillStyle(flagStones[(row * 3 + Math.abs(col)) % flagStones.length])
        g.fillRect(bx, by, bw, bh)
        g.fillStyle(0x2a2622)
        g.fillRect(bx, by, bw, 2)
      }
    }

    // â”€â”€ Central tavern rug / carpet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const rx = zx + 280, ry = zy + 310, rw = 640, rh = 560
    // Rug base (deep red)
    g.fillStyle(0x3a0e08); g.fillRect(rx, ry, rw, rh)
    // Inner field (slightly lighter)
    g.fillStyle(0x451208); g.fillRect(rx + 14, ry + 14, rw - 28, rh - 28)
    // Outer border stripe
    g.lineStyle(5, 0x6a1e10); g.strokeRect(rx + 6, ry + 6, rw - 12, rh - 12)
    // Inner border stripe
    g.lineStyle(3, 0x5a1a0c); g.strokeRect(rx + 22, ry + 22, rw - 44, rh - 44)
    // Corner tassels
    ;[[rx+6,ry+6],[rx+rw-6,ry+6],[rx+6,ry+rh-6],[rx+rw-6,ry+rh-6]].forEach(([tx,ty]) => {
      g.fillStyle(0x7a2a14); g.fillCircle(tx, ty, 8)
    })
    // Central medallion
    const mcx = zx + 600, mcy = zy + 590
    g.lineStyle(3, 0x7a2010, 0.8); g.strokeCircle(mcx, mcy, 90)
    g.lineStyle(2, 0x681a0e, 0.6); g.strokeCircle(mcx, mcy, 65)
    g.lineStyle(1, 0x5a1610, 0.5); g.strokeCircle(mcx, mcy, 40)
    // 4 petal shapes in medallion
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2
      g.fillStyle(0x5a1610)
      g.fillEllipse(mcx + Math.cos(a) * 52, mcy + Math.sin(a) * 52, 28, 18)
    }
  }

  _drawDoorways() {
    const VW = 34   // visual wall width
    const g = this.add.graphics().setDepth(2)

    // â”€â”€ Helper: filled stone wall strip with mortar lines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const wallStrip = (x, y, w, h, isHoriz) => {
      g.fillStyle(0x1e1c18); g.fillRect(x, y, w, h)
      // Mortar course lines run perpendicular to the wall's length
      g.fillStyle(0x100e0c)
      const STEP = 44
      if (isHoriz) {
        for (let lx = x + STEP / 2; lx < x + w; lx += STEP) g.fillRect(Math.round(lx), y, 4, h)
      } else {
        for (let ly = y + STEP / 2; ly < y + h; ly += STEP) g.fillRect(x, Math.round(ly), w, 4)
      }
      // Outer edge highlights
      g.fillStyle(0x2e2c28)
      if (isHoriz) g.fillRect(x, y, w, 3)
      else         g.fillRect(x, y, 3, h)
      g.fillStyle(0x0c0a08)
      if (isHoriz) g.fillRect(x, y + h - 3, w, 3)
      else         g.fillRect(x + w - 3, y, 3, h)
    }

    // â”€â”€ Helper: pillar caps flanking a door opening â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const doorCaps = (wallPos, openStart, openEnd, isHoriz) => {
      const capThick = 18, capSpan = VW + 12
      g.fillStyle(0x2c2a24)
      if (!isHoriz) {
        // Vertical wall â€” caps above and below the opening
        g.fillRect(wallPos - capSpan / 2, openStart - capThick, capSpan, capThick)
        g.fillRect(wallPos - capSpan / 2, openEnd,              capSpan, capThick)
        g.fillStyle(0x3c3a34)
        g.fillRect(wallPos - capSpan / 2, openStart - capThick, capSpan, 3)
        g.fillRect(wallPos - capSpan / 2, openEnd + capThick - 3, capSpan, 3)
        // Torch-light glow along the passage centre line
        g.lineStyle(3, 0x88cc88, 0.22)
        g.lineBetween(wallPos, openStart, wallPos, openEnd)
      } else {
        // Horizontal wall â€” caps left and right of the opening
        g.fillRect(openStart - capThick, wallPos - capSpan / 2, capThick, capSpan)
        g.fillRect(openEnd,              wallPos - capSpan / 2, capThick, capSpan)
        g.fillStyle(0x3c3a34)
        g.fillRect(openStart - capThick, wallPos - capSpan / 2, 3, capSpan)
        g.fillRect(openEnd + capThick - 3, wallPos - capSpan / 2, 3, capSpan)
        g.lineStyle(3, 0x88cc88, 0.22)
        g.lineBetween(openStart, wallPos, openEnd, wallPos)
      }
    }

    // â”€â”€ Full vertical walls at x=1200 and x=2400 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Each spans the entire world height, split into two strips with an opening.
    ;[1200, 2400].forEach(bx => {
      const wx = bx - VW / 2
      wallStrip(wx, 0,           VW, SIDE_DOOR_T,           false)  // above opening
      wallStrip(wx, SIDE_DOOR_B, VW, WORLD_H - SIDE_DOOR_B, false)  // below opening
      doorCaps(bx, SIDE_DOOR_T, SIDE_DOOR_B, false)
    })

    // â”€â”€ Full horizontal walls at y=1200 and y=2400 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ;[1200, 2400].forEach(by => {
      const wy = by - VW / 2
      wallStrip(0,            wy, HORIZ_DOOR_L,             VW, true)  // left of opening
      wallStrip(HORIZ_DOOR_R, wy, WORLD_W - HORIZ_DOOR_R,   VW, true)  // right of opening
      doorCaps(by, HORIZ_DOOR_L, HORIZ_DOOR_R, true)
    })
  }

  _drawZoneLabels() {
    const zones = [
      { zx: ZX.TEMPLE, zy: ZY.TEMPLE, name: 'THE TECH TEMPLE',    sub: 'Skills & Expertise',       col: '#aa88ff' },
      { zx: ZX.FORGE,  zy: ZY.FORGE,  name: 'THE GAME FORGE',      sub: 'Projects & Creations',     col: '#ff8844' },
      { zx: ZX.HUB,    zy: ZY.HUB,    name: "DEVELOPER'S REALM",   sub: 'Central Hub',              col: '#88ff88' },
      { zx: ZX.ARENA,  zy: ZY.ARENA,  name: 'ACHIEVEMENT ARENA',   sub: 'Certificates & Awards',    col: '#ffd700' },
      { zx: ZX.TAVERN, zy: ZY.TAVERN, name: 'QUEST LOG TAVERN',    sub: 'Experience & Education',   col: '#ffbb66' },
    ]
    zones.forEach(({ zx, zy, name, sub, col }) => {
      this.add.text(zx + ZONE_W / 2, zy + 28, name, {
        fontSize: '20px', color: col, fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 0).setAlpha(0.85)
      this.add.text(zx + ZONE_W / 2, zy + 56, sub, {
        fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 0).setAlpha(0.7)
    })
  }

  // â”€â”€ TEMPLE (zx=1200, zy=0) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildTemple() {
    const zx = ZX.TEMPLE, zy = ZY.TEMPLE
    const g = this.add.graphics()

    // Floor rune circles
    ;[[zx+300,zy+300],[zx+900,zy+300],[zx+300,zy+900],[zx+900,zy+900],[zx+600,zy+600]].forEach(([x,y]) => {
      g.lineStyle(2, C.templeAccent, 0.3); g.strokeCircle(x, y, 100)
      g.lineStyle(1, C.templeAccent, 0.2); g.strokeCircle(x, y, 65)
    })

    // Pillars along left and right interior edges
    ;[[zx+30,zy+100],[zx+30,zy+380],[zx+30,zy+680],[zx+30,zy+960],
      [zx+1150,zy+100],[zx+1150,zy+380],[zx+1150,zy+680],[zx+1150,zy+960]].forEach(([px, py]) => {
      g.fillStyle(0x1a0040); g.fillRect(px, py, 30, 60)
      g.fillStyle(0x442288); g.fillRect(px+2, py, 26, 4)
      g.fillStyle(0x442288); g.fillRect(px+2, py+56, 26, 4)
    })

    // Stone arch + Ancient Tome alcove on left side
    g.lineStyle(4, 0x442288, 0.6)
    g.strokeRect(zx + 60, zy+480, 140, 200)
    g.fillStyle(0x110030, 0.8); g.fillRect(zx + 60, zy+480, 140, 200)
    this.add.text(zx + 130, zy+530, 'Ancient\nTome', {
      fontSize: '12px', color: '#aa88ff', fontFamily: 'monospace', align: 'center',
    }).setOrigin(0.5, 0)

    // Floating rune particles
    this._spawnParticles(zx+600, zy+600, 0x8844ff, 600, 30)
    this._spawnParticles(zx+250, zy+300, 0x5522cc, 400, 15)
    this._spawnParticles(zx+900, zy+900, 0x6633ff, 400, 15)

    // Direction sign pointing back down to HUB
    this._drawSign(zx+600, zy+1100, 'â†“ HUB', '#88ff88')
  }

  // â”€â”€ FORGE (zx=0, zy=1200) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildForge() {
    const zx = ZX.FORGE, zy = ZY.FORGE
    const g = this.add.graphics()

    // Anvil / workbench at center
    g.fillStyle(0x444444); g.fillRect(zx+540, zy+530, 120, 30)
    g.fillStyle(0x555555); g.fillRect(zx+550, zy+510, 100, 24)
    g.fillStyle(0x333333); g.fillRect(zx+556, zy+560, 30, 20); g.fillRect(zx+614, zy+560, 30, 20)

    // Wall tool racks top and bottom
    ;[[zx+80,zy+20],[zx+880,zy+20],[zx+80,zy+1155],[zx+880,zy+1155]].forEach(([px,py]) => {
      g.fillStyle(0x553300); g.fillRect(px, py, 120, 16)
      g.fillStyle(0x887755)
      for (let i=0;i<5;i++) { g.fillRect(px+10+i*22, py+16, 6, 30) }
    })

    // Furnaces (3 per row, 2 rows) â€” positions match project orbs
    ;[[zx+200,zy+340],[zx+600,zy+340],[zx+1000,zy+340],
      [zx+200,zy+800],[zx+600,zy+800],[zx+1000,zy+800]].forEach(([fx,fy]) => {
      g.fillStyle(0x444444); g.fillRect(fx-50, fy-10, 100, 80)
      g.fillStyle(0x221100); g.fillRect(fx-30, fy, 60, 60)
      g.fillStyle(C.forgeFire, 0.9); g.fillRect(fx-20, fy+10, 40, 40)
      g.fillStyle(0xff8800, 0.8); g.fillRect(fx-12, fy+20, 24, 28)
      g.fillStyle(0xffdd00, 0.7); g.fillRect(fx-6, fy+30, 12, 18)
      g.fillStyle(0x333333); g.fillRect(fx-15, fy-60, 30, 55)
    })

    // Sparks / fire particles
    ;[[zx+200,zy+330],[zx+600,zy+330],[zx+1000,zy+330],
      [zx+200,zy+790],[zx+600,zy+790],[zx+1000,zy+790]].forEach(([px,py]) => {
      this._spawnParticles(px, py, 0xff6600, 500, 20, 80, -80)
    })
    this._spawnParticles(zx+600, zy+545, 0xff4400, 300, 10, 40, 0)

    // Direction sign pointing right to HUB
    this._drawSign(zx+1050, zy+600, 'â†’ HUB', '#88ff88')
  }

  // â”€â”€ HUB (zx=1200, zy=1200) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildHub() {
    const zx = ZX.HUB, zy = ZY.HUB
    const g = this.add.graphics()

    // Stone paths â€” cross pattern (horizontal + vertical)
    g.fillStyle(C.hubPath, 0.7)
    g.fillRect(zx,       zy+440, ZONE_W, 320)   // horizontal
    g.fillRect(zx+440,   zy,     320, ZONE_H)   // vertical

    // Central courtyard circle
    g.fillStyle(0x1e3a10, 0.6); g.fillCircle(zx+600, zy+600, 230)

    // Trees at 4 corners
    ;[[zx+120,zy+120],[zx+1080,zy+120],[zx+120,zy+1080],[zx+1080,zy+1080]].forEach(([tx,ty]) => {
      g.fillStyle(0x2a5a15); g.fillCircle(tx, ty, 60)
      g.fillStyle(0x1d4010); g.fillCircle(tx-15, ty-15, 38)
      g.fillStyle(0x4a9020); g.fillCircle(tx+10, ty-20, 28)
      g.fillStyle(0x3d2200); g.fillRect(tx-10, ty+45, 20, 50)
    })

    // Decorative path stones along both paths
    ;[[zx+200,zy+460],[zx+400,zy+460],[zx+800,zy+460],[zx+1000,zy+460],
      [zx+200,zy+740],[zx+400,zy+740],[zx+800,zy+740],[zx+1000,zy+740],
      [zx+460,zy+200],[zx+460,zy+400],[zx+460,zy+800],[zx+460,zy+1000],
      [zx+740,zy+200],[zx+740,zy+400],[zx+740,zy+800],[zx+740,zy+1000]].forEach(([sx,sy]) => {
      g.fillStyle(0x445533, 0.5); g.fillCircle(sx, sy, 12)
    })

    // Fountain base at center
    g.fillStyle(0x445533); g.fillCircle(zx+600, zy+600, 55)
    g.fillStyle(0x334422); g.fillCircle(zx+600, zy+600, 42)
    g.fillStyle(0x2255aa, 0.6); g.fillCircle(zx+600, zy+600, 30)
    this._spawnParticles(zx+600, zy+570, 0x44aaff, 800, 20, 60, -80)

    // Directional sign posts near each door
    this._drawSign(zx+90, zy+600, 'â† FORGE\nProjects', '#ff8844')
    this._drawSign(zx+1110, zy+600, 'ARENA â†’\nCerts', '#ffd700')
    this._drawSign(zx+600, zy+100, 'â†‘ TEMPLE\nSkills', '#aa88ff')
    this._drawSign(zx+600, zy+1100, 'â†“ TAVERN\nExperience', '#ffbb66')

    // Welcome banner
    g.fillStyle(0x1a4a10, 0.9); g.fillRect(zx+160, zy+270, 880, 70)
    g.lineStyle(2, 0x44aa44, 0.6); g.strokeRect(zx+160, zy+270, 880, 70)
    this.add.text(zx+600, zy+305, "Welcome to the Developer's Realm!", {
      fontSize: '18px', color: '#88ff88', fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5)

    // Ambient sparkles
    this._spawnParticles(zx+600, zy+500, 0x88ff88, 2000, 25, 200, -30)
  }

  // â”€â”€ ARENA (zx=2400, zy=1200) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildArena() {
    const zx = ZX.ARENA, zy = ZY.ARENA
    const g = this.add.graphics()

    // Marble floor pattern
    g.fillStyle(0x001226, 0.5)
    for (let tx = zx; tx < zx+ZONE_W; tx += 80) {
      for (let ty = zy; ty < zy+ZONE_H; ty += 80) {
        if (((tx-zx)/80+(ty-zy)/80)%3===0) { g.fillRect(tx, ty, 80, 80) }
      }
    }

    // Columns along top and bottom interior edges
    ;[[zx+50,zy+40],[zx+280,zy+40],[zx+510,zy+40],[zx+740,zy+40],[zx+970,zy+40],[zx+1150,zy+40],
      [zx+50,zy+1130],[zx+280,zy+1130],[zx+510,zy+1130],[zx+740,zy+1130],[zx+970,zy+1130],[zx+1150,zy+1130]].forEach(([cx,cy]) => {
      g.fillStyle(0x223355); g.fillRect(cx, cy, 30, 30)
      g.fillStyle(0xff8800, 0.8); g.fillCircle(cx+15, cy-8, 10)
      g.fillStyle(0xffdd00, 0.6); g.fillCircle(cx+15, cy-14, 6)
    })

    // Banners on top and right wall
    ;[zx+80, zx+330, zx+580, zx+830, zx+1080].forEach(bx => {
      g.fillStyle(0x0a1840, 0.9); g.fillRect(bx, zy+90, 50, 160)
      g.fillStyle(C.arenaGold, 0.7); g.fillRect(bx+4, zy+90, 6, 160); g.fillRect(bx+40, zy+90, 6, 160)
      g.fillStyle(C.arenaGold, 0.5); g.fillRect(bx+10, zy+100, 30, 4); g.fillRect(bx+10, zy+130, 30, 4)
    })

    // Torch particles at columns
    ;[[zx+65,zy+28],[zx+295,zy+28],[zx+525,zy+28],[zx+755,zy+28]].forEach(([px,py]) => {
      this._spawnParticles(px, py, 0xff8800, 600, 8, 20, -40)
    })

    // Central golden light
    this._spawnParticles(zx+600, zy+600, 0xffd700, 3000, 15, 300, -20)

    // Direction sign pointing back left to HUB
    this._drawSign(zx+150, zy+600, 'â† HUB', '#88ff88')
  }

  // â”€â”€ TAVERN (zx=1200, zy=2400) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildTavern() {
    const zx = ZX.TAVERN, zy = ZY.TAVERN
    const g = this.add.graphics()

    // Wood plank floor lines
    g.lineStyle(1, 0x1a0a00, 0.4)
    for (let ty = zy; ty < zy + ZONE_H; ty += 30) {
      g.moveTo(zx, ty); g.lineTo(zx + ZONE_W, ty)
    }

    // Bar counter (left area)
    g.fillStyle(C.tavernWood); g.fillRect(zx+60, zy+350, 280, 50)
    g.fillStyle(0x8b5a28); g.fillRect(zx+60, zy+350, 280, 8)
    g.fillStyle(0x6b4010); g.fillRect(zx+60, zy+358, 280, 42)
    // Bottles on bar
    ;[[zx+100,zy+318],[zx+140,zy+316],[zx+180,zy+320],[zx+220,zy+318],[zx+260,zy+317]].forEach(([bx,by]) => {
      const bc = [0x44aa44,0xaa4444,0x4444aa,0xaaaa44,0x44aaaa][Math.floor(Math.random()*5)]
      g.fillStyle(bc); g.fillRect(bx, by, 10, 30)
      g.fillStyle(0xffffff, 0.3); g.fillRect(bx+2, by+2, 3, 8)
    })

    // Tables (2x2)
    ;[[zx+500,zy+380],[zx+820,zy+380],[zx+500,zy+820],[zx+820,zy+820]].forEach(([tx,ty]) => {
      g.fillStyle(C.tavernWood); g.fillCircle(tx, ty, 52)
      g.fillStyle(0x8b5a28, 0.8); g.fillCircle(tx, ty, 52)
      ;[[-65,0],[65,0],[0,-65],[0,65]].forEach(([ox,oy]) => {
        g.fillStyle(0x663300); g.fillRect(tx+ox-14, ty+oy-14, 28, 28)
        g.fillStyle(0x884400); g.fillRect(tx+ox-12, ty+oy-12, 24, 4)
      })
      g.fillStyle(0xffdd00, 0.8); g.fillCircle(tx, ty, 10)
      g.fillStyle(0xff6600, 0.7); g.fillCircle(tx, ty-12, 7)
    })

    // Fireplace on right wall
    g.fillStyle(0x553322); g.fillRect(zx+1050, zy+420, 120, 140)
    g.fillStyle(0x221100); g.fillRect(zx+1070, zy+450, 80, 100)
    g.fillStyle(0xff4400, 0.9); g.fillRect(zx+1080, zy+490, 60, 54)
    g.fillStyle(0xff8800, 0.8); g.fillRect(zx+1090, zy+510, 40, 34)
    g.fillStyle(0xffdd00, 0.6); g.fillRect(zx+1098, zy+526, 24, 18)
    this._spawnParticles(zx+1110, zy+440, 0xff6600, 600, 20, 40, -60)

    // Candle particles on tables
    ;[[zx+500,zy+362],[zx+820,zy+362],[zx+500,zy+802],[zx+820,zy+802]].forEach(([px,py]) => {
      this._spawnParticles(px, py, 0xffcc44, 1200, 5, 15, -30)
    })

    // Cozy ambient light
    this._spawnParticles(zx+600, zy+600, 0xffaa44, 4000, 10, 400, -10)

    // Direction sign pointing back up to HUB
    this._drawSign(zx+600, zy+110, 'â†‘ HUB', '#88ff88')
  }

  // â”€â”€ Direction signs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _drawSign(x, y, label, color = '#ffffff') {
    const g = this.add.graphics().setDepth(8)
    const lines = label.split('\n')
    const w = 120, h = lines.length > 1 ? 44 : 28
    // Sign post
    g.fillStyle(0x4a2f10); g.fillRect(x - 4, y, 8, 28)
    // Sign board
    g.fillStyle(0x2a1800, 0.92); g.fillRect(x - w/2, y - h, w, h)
    g.lineStyle(2, 0x886644, 0.8); g.strokeRect(x - w/2, y - h, w, h)
    // Text
    this.add.text(x, y - h/2, label, {
      fontSize: '11px', color, fontFamily: 'monospace',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(9)
  }

  // â”€â”€â”€ Walls & boundaries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _buildWalls() {
    this.walls = this.physics.add.staticGroup()
    const W = 18  // wall thickness

    const addWall = (x, y, w, h, vis = false, col = 0x000000) => {
      const wall = this.add.rectangle(x + w/2, y + h/2, w, h, col, vis ? 0.15 : 0)
      this.physics.add.existing(wall, true)
      this.walls.add(wall)
    }

    // â”€â”€ World borders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    addWall(0,         0,         WORLD_W, W)
    addWall(0,         WORLD_H-W, WORLD_W, W)
    addWall(0,         0,         W, WORLD_H)
    addWall(WORLD_W-W, 0,         W, WORLD_H)

    // â”€â”€ Corner-isolating zone walls (no doors) â€” visuals drawn by _drawDoorways
    addWall(ZX.TEMPLE - W/2,           ZY.TEMPLE, W, ZONE_H)
    addWall(ZX.TEMPLE + ZONE_W - W/2,  ZY.TEMPLE, W, ZONE_H)
    addWall(ZX.TAVERN - W/2,           ZY.TAVERN, W, ZONE_H)
    addWall(ZX.TAVERN + ZONE_W - W/2,  ZY.TAVERN, W, ZONE_H)
    addWall(ZX.FORGE, ZY.FORGE - W/2,           ZONE_W, W)
    addWall(ZX.FORGE, ZY.FORGE + ZONE_H - W/2,  ZONE_W, W)
    addWall(ZX.ARENA, ZY.ARENA - W/2,           ZONE_W, W)
    addWall(ZX.ARENA, ZY.ARENA + ZONE_H - W/2,  ZONE_W, W)

    // â”€â”€ Zone boundary walls with doors â€” visuals drawn by _drawDoorways â”€â”€â”€â”€â”€â”€â”€
    addWall(1200 - W/2, ZY.HUB,          W, SIDE_DOOR_T - ZY.HUB)
    addWall(1200 - W/2, SIDE_DOOR_B,     W, ZY.HUB + ZONE_H - SIDE_DOOR_B)
    addWall(2400 - W/2, ZY.HUB,          W, SIDE_DOOR_T - ZY.HUB)
    addWall(2400 - W/2, SIDE_DOOR_B,     W, ZY.HUB + ZONE_H - SIDE_DOOR_B)
    addWall(ZX.HUB,          1200 - W/2, HORIZ_DOOR_L - ZX.HUB,          W)
    addWall(HORIZ_DOOR_R,    1200 - W/2, ZX.HUB + ZONE_W - HORIZ_DOOR_R, W)
    addWall(ZX.HUB,          2400 - W/2, HORIZ_DOOR_L - ZX.HUB,          W)
    addWall(HORIZ_DOOR_R,    2400 - W/2, ZX.HUB + ZONE_W - HORIZ_DOOR_R, W)

    // â”€â”€ Internal object blockers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // FORGE furnaces
    ;[[ZX.FORGE+200,ZY.FORGE+340],[ZX.FORGE+600,ZY.FORGE+340],[ZX.FORGE+1000,ZY.FORGE+340],
      [ZX.FORGE+200,ZY.FORGE+800],[ZX.FORGE+600,ZY.FORGE+800],[ZX.FORGE+1000,ZY.FORGE+800]].forEach(([fx,fy]) => {
      addWall(fx-50, fy-10, 100, 80)
    })
    // TAVERN bar
    addWall(ZX.TAVERN+60, ZY.TAVERN+350, 280, 50)
    // TAVERN fireplace
    addWall(ZX.TAVERN+1050, ZY.TAVERN+420, 120, 140)
  }

  // â”€â”€â”€ Player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _createPlayer() {
    // Start at center of HUB
    this.player = this.physics.add.sprite(ZX.HUB + 600, ZY.HUB + 600, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(20)
    this.player.body.setSize(16, 14)
    this.player.body.setOffset(4, 20)
    this.physics.add.collider(this.player, this.walls)

    // Animations
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1, repeat: -1,
    })
    this.anims.create({
      key: 'player_walk',
      frames: [
        { key: 'player', frame: 1 },
        { key: 'player', frame: 2 },
        { key: 'player', frame: 3 },
        { key: 'player', frame: 2 },
      ],
      frameRate: 8, repeat: -1,
    })
    this.player.anims.play('player_idle')

    const shadow = this.add.ellipse(0, 0, 22, 8, 0x000000, 0.3).setDepth(19)
    this._playerShadow = shadow
  }

  // â”€â”€â”€ NPCs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _createNPCs() {
    const npcs = [
      { x: ZX.TEMPLE+900, y: ZY.TEMPLE+620, tex: 'npc_sage', id: 'sage',
        dialogue: {
          type: 'npc', zone: 'temple', npcName: 'The Sage',
          text: "Greetings, traveler! I am the Keeper of the Tech Temple. Palaash has studied many arcane arts â€” from the dark magic of C++ to the visual sorcery of Blueprints. Examine each crystal pillar to discover the knowledge he has mastered. The four pillars represent Game Development, Programming, Tools, and Design.",
        },
      },
      { x: ZX.FORGE+600, y: ZY.FORGE+580, tex: 'npc_smith', id: 'smith',
        dialogue: {
          type: 'npc', zone: 'forge', npcName: 'Magnus the Forge Master',
          text: "Ho there! I am Magnus, keeper of the Game Forge! Palaash forged every artefact you see here with his own hands â€” six games, each hammered out with C++ and Blueprints and Unity. From a time-bending FPS to an AR PokÃ©mon world! Examine the glowing orbs above each forge to learn more about his creations.",
        },
      },
      { x: ZX.HUB+400, y: ZY.HUB+460, tex: 'npc_guide', id: 'guide',
        dialogue: {
          type: 'npc', zone: 'hub', npcName: 'Realm Guide',
          text: `Welcome to the Developer's Realm, adventurer! I'm the guide here. Each doorway leads to a room â€” NORTH: the Tech Temple (skills). SOUTH: the Quest Log Tavern (experience & education). WEST: the Game Forge (projects). EAST: the Achievement Arena (certificates). The glowing obelisk holds Palaash's full story. Explore freely â€” press E near any glowing object to interact!`,
        },
      },
      { x: ZX.ARENA+600, y: ZY.ARENA+580, tex: 'npc_herald', id: 'herald',
        dialogue: {
          type: 'npc', zone: 'arena', npcName: 'The Herald',
          text: "Hear ye! I am the Herald of the Achievement Arena. The pedestals before you display the honours won by Palaash Dwivedi â€” certificates of mastery and a prestigious game jam award. The golden trophy on the first pedestal? That's the Best Game award from Pixel Clash 2025, won for the eco-game Bin It Right. Step close to any pedestal to read the full citation.",
        },
      },
      { x: ZX.TAVERN+280, y: ZY.TAVERN+450, tex: 'npc_barkeep', id: 'barkeep',
        dialogue: {
          type: 'npc', zone: 'tavern', npcName: 'Guildmaster Reva',
          text: "Ah, a traveler! Sit down, sit down. I'm Reva â€” keeper of the Quest Log. That board on the wall shows Palaash's active quest: a Game Dev Internship at Enable India, building accessibility systems in Unreal Engine. The scroll nearby holds his academic journey â€” third year at Jain University, studying Game Development. Impressive grades too!",
        },
      },
    ]

    npcs.forEach(npc => {
      const sprite = this.physics.add.sprite(npc.x, npc.y, npc.tex).setDepth(15)
      sprite.body.setImmovable(true)
      sprite.body.setSize(20, 20)
      this.physics.add.collider(this.player, sprite)

      this.tweens.add({
        targets: sprite, y: npc.y - 5, duration: 900 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      this.add.text(npc.x, npc.y - 34, npc.dialogue.npcName, {
        fontSize: '11px', color: '#ffff88', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(16)

      const excl = this.add.text(npc.x, npc.y - 46, '!', {
        fontSize: '16px', color: '#ffff00', fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(17)
      this.tweens.add({ targets: excl, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 })

      this.interactables.push({ x: npc.x, y: npc.y, type: 'npc', data: npc.dialogue, id: `npc_${npc.id}`, label: '[E] Talk' })
    })
  }

  // â”€â”€â”€ Interactive Objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _createInteractables() {
    this._createProjectOrbs()
    this._createSkillCrystals()
    this._createCertPedestals()
    this._createAboutObelisk()
    this._createQuestBoard()
    this._createEducationScroll()
  }

  _createProjectOrbs() {
    // 6 orbs in FORGE zone, 2 rows of 3, above furnaces
    const positions = [
      [ZX.FORGE+200, ZY.FORGE+300],
      [ZX.FORGE+600, ZY.FORGE+300],
      [ZX.FORGE+1000,ZY.FORGE+300],
      [ZX.FORGE+200, ZY.FORGE+760],
      [ZX.FORGE+600, ZY.FORGE+760],
      [ZX.FORGE+1000,ZY.FORGE+760],
    ]
    PROJECTS.forEach((proj, i) => {
      const [ox, oy] = positions[i]

      const orb = this.add.image(ox, oy - 30, 'orb')
        .setTint(proj.accent).setDepth(12).setScale(1.1)

      const glow = this.add.graphics().setDepth(11)
      glow.lineStyle(3, proj.accent, 0.4)
      glow.strokeCircle(ox, oy - 30, 30)

      this.tweens.add({
        targets: orb, y: oy - 42, duration: 1400 + i * 120,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      this.add.text(ox, oy + 16, proj.number, {
        fontSize: '18px', color: proj.accentHex, fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 0).setDepth(13)

      this.add.text(ox, oy + 40, proj.title, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 3, wordWrap: { width: 160 }, align: 'center',
      }).setOrigin(0.5, 0).setDepth(13)

      this.interactables.push({ x: ox, y: oy - 30, type: 'project', data: proj, id: `proj_${proj.id}`, label: '[E] Examine' })
    })
  }

  _createSkillCrystals() {
    // 4 crystals in TEMPLE zone, 2x2 grid
    const positions = [
      [ZX.TEMPLE+280, ZY.TEMPLE+300],
      [ZX.TEMPLE+780, ZY.TEMPLE+300],
      [ZX.TEMPLE+280, ZY.TEMPLE+780],
      [ZX.TEMPLE+780, ZY.TEMPLE+780],
    ]
    SKILLS_DATA.forEach((skill, i) => {
      const [cx, cy] = positions[i]

      const crystal = this.add.image(cx, cy, 'crystal')
        .setTint(skill.color).setDepth(12).setScale(1.4)

      const aura = this.add.graphics().setDepth(11)
      aura.fillStyle(skill.color, 0.12)
      aura.fillCircle(cx, cy, 55)

      this.tweens.add({
        targets: crystal, y: cy - 12, duration: 1600 + i * 200,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      this.add.text(cx, cy + 40, skill.icon + ' ' + skill.category, {
        fontSize: '12px', color: skill.colorHex, fontFamily: 'monospace',
        fontStyle: 'bold', stroke: '#000000', strokeThickness: 3, align: 'center',
      }).setOrigin(0.5, 0).setDepth(13)

      this._spawnParticles(cx, cy, skill.color, 1000 + i * 300, 8, 40, -20)

      this.interactables.push({ x: cx, y: cy, type: 'skill', data: skill, id: `skill_${skill.id}`, label: '[E] Inspect' })
    })
  }

  _createCertPedestals() {
    // 6 pedestals in ARENA zone, 2 rows of 3
    const positions = [
      [ZX.ARENA+200, ZY.ARENA+380],
      [ZX.ARENA+580, ZY.ARENA+380],
      [ZX.ARENA+960, ZY.ARENA+380],
      [ZX.ARENA+200, ZY.ARENA+840],
      [ZX.ARENA+580, ZY.ARENA+840],
      [ZX.ARENA+960, ZY.ARENA+840],
    ]
    const g = this.add.graphics().setDepth(10)

    CERTIFICATES.forEach((cert, i) => {
      const [px, py] = positions[i]

      g.fillStyle(0x223355); g.fillRect(px-50, py+20, 100, 60)
      g.fillStyle(0x334466); g.fillRect(px-44, py+22, 88, 16)
      g.fillStyle(cert.isAward ? 0xd4a500 : 0x445577)
      g.fillRect(px-40, py+16, 80, 8)

      const trophy = this.add.image(px, py, 'trophy')
        .setTint(cert.isAward ? 0xffd700 : 0xaaaacc)
        .setDepth(12).setScale(cert.isAward ? 1.2 : 0.9)

      this.tweens.add({
        targets: trophy, y: py - 8, duration: 1500 + i * 180,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      if (cert.isAward) {
        this.tweens.add({ targets: trophy, angle: 360, duration: 6000, repeat: -1 })
        this._spawnParticles(px, py - 10, 0xffd700, 800, 15, 50, -30)
      }

      const shortTitle = cert.title.length > 22 ? cert.title.slice(0, 22) + 'â€¦' : cert.title
      this.add.text(px, py + 90, shortTitle, {
        fontSize: '10px', color: cert.isAward ? '#ffd700' : '#aabbcc',
        fontFamily: 'monospace', stroke: '#000000', strokeThickness: 3,
        wordWrap: { width: 130 }, align: 'center',
      }).setOrigin(0.5, 0).setDepth(13)

      this.interactables.push({ x: px, y: py, type: 'cert', data: cert, id: `cert_${cert.id}`, label: '[E] View' })
    })
  }

  _createAboutObelisk() {
    const ox = ZX.HUB + 600, oy = ZY.HUB + 390
    const g = this.add.graphics().setDepth(10)

    g.fillStyle(0x223322); g.fillRect(ox-28, oy+80, 56, 20)
    g.fillStyle(0x2a3a2a); g.fillRect(ox-20, oy+40, 40, 44)
    g.fillStyle(0x334433); g.fillRect(ox-14, oy-60, 28, 104)
    g.fillStyle(0x224422); g.fillRect(ox-14, oy-60, 28, 104)
    g.fillStyle(0x44aa44)
    g.fillTriangle(ox, oy-100, ox+14, oy-60, ox-14, oy-60)
    g.lineStyle(1, 0x66ff66, 0.5)
    g.strokeRect(ox-10, oy-50, 20, 80)
    g.fillStyle(0x88ff88, 0.5); g.fillCircle(ox, oy-102, 12)

    this._spawnParticles(ox, oy - 90, 0x44ff44, 2000, 12, 30, -40)

    this.tweens.add({
      targets: g, alpha: 0.75, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    this.interactables.push({ x: ox, y: oy - 50, type: 'about', data: ABOUT, id: 'about_obelisk', label: '[E] Read' })
  }

  _createQuestBoard() {
    const bx = ZX.TAVERN + 500, by = ZY.TAVERN + 250
    const g = this.add.graphics().setDepth(10)

    g.fillStyle(0x5a3010); g.fillRect(bx-90, by-10, 180, 200)
    g.fillStyle(0x4a2808); g.fillRect(bx-84, by-4, 168, 188)
    ;[[0xffee88,bx-70,by+20],[0xffeebb,bx-10,by+10],[0xffffaa,bx+30,by+30],
      [0xddffcc,bx-60,by+90],[0xffddcc,bx+10,by+80],[0xccffee,bx-40,by+130]].forEach(([c,nx,ny]) => {
      g.fillStyle(c, 0.9); g.fillRect(nx, ny, 50, 38)
      g.fillStyle(c, 0.4); g.fillRect(nx+3, ny+3, 30, 3); g.fillRect(nx+3, ny+10, 20, 3); g.fillRect(nx+3, ny+17, 25, 3)
    })
    g.fillStyle(0x332200); g.fillRect(bx-70, by+2, 140, 16)
    this.add.text(bx, by+10, 'âš” ACTIVE QUESTS', {
      fontSize: '10px', color: '#ffcc44', fontFamily: 'monospace', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(12)

    this.interactables.push({ x: bx, y: by + 90, type: 'experience', data: ABOUT.experience, id: 'quest_board', label: '[E] Read' })
  }

  _createEducationScroll() {
    const sx = ZX.TAVERN + 950, sy = ZY.TAVERN + 230
    const g = this.add.graphics().setDepth(10)

    g.fillStyle(0xeedd99); g.fillRect(sx-60, sy, 120, 160)
    g.fillStyle(0xcc9944); g.fillCircle(sx-60, sy+10, 12); g.fillCircle(sx+60, sy+10, 12)
    g.fillStyle(0xcc9944); g.fillCircle(sx-60, sy+150, 12); g.fillCircle(sx+60, sy+150, 12)
    g.fillStyle(0x443300, 0.5)
    for (let ly = sy+30; ly < sy+140; ly+=16) { g.fillRect(sx-48, ly, 96, 3) }
    g.fillStyle(0x221100, 0.8); g.fillRect(sx-48, sy+18, 96, 6)

    this.add.text(sx, sy+22, 'ðŸ“œ EDUCATION', {
      fontSize: '9px', color: '#442200', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(12)

    this.interactables.push({ x: sx, y: sy + 80, type: 'education', data: ABOUT.education, id: 'edu_scroll', label: '[E] Read' })
  }

  // â”€â”€â”€ Collectibles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _createCollectibles() {
    const spots = [
      // Temple
      [ZX.TEMPLE+100,  ZY.TEMPLE+620, 0xaa88ff, 'temple_1', 'Rune of Knowledge'],
      [ZX.TEMPLE+1100, ZY.TEMPLE+620, 0x8866cc, 'temple_2', 'Ancient Insight'],
      [ZX.TEMPLE+600,  ZY.TEMPLE+1100,0x6644bb, 'temple_3', 'Mystic Fragment'],
      // Forge
      [ZX.FORGE+100,   ZY.FORGE+620, 0xff6600, 'forge_1', 'Forge Spark'],
      [ZX.FORGE+1100,  ZY.FORGE+620, 0xff8800, 'forge_2', 'Ember Shard'],
      [ZX.FORGE+600,   ZY.FORGE+1100,0xffaa00, 'forge_3', 'Creation Essence'],
      // Hub
      [ZX.HUB+100,     ZY.HUB+100,  0x44ff44, 'hub_1', 'Realm Token'],
      [ZX.HUB+1100,    ZY.HUB+1100, 0x66ff88, 'hub_2', 'Explorer Badge'],
      // Arena
      [ZX.ARENA+100,   ZY.ARENA+620, 0xffd700, 'arena_1', 'Gold Medal'],
      [ZX.ARENA+1100,  ZY.ARENA+620, 0xffcc00, 'arena_2', 'Arena Coin'],
      [ZX.ARENA+600,   ZY.ARENA+1100,0xffaa00, 'arena_3', 'Trophy Shard'],
      // Tavern
      [ZX.TAVERN+100,  ZY.TAVERN+620, 0xffbb66, 'tavern_1', 'Guild Coin'],
      [ZX.TAVERN+600,  ZY.TAVERN+1100,0xffaa44, 'tavern_2', 'Quest Token'],
      [ZX.TAVERN+1100, ZY.TAVERN+620, 0xff9933, 'tavern_3', 'Tavern Medal'],
    ]

    spots.forEach(([x, y, color, id, name]) => {
      const g = this.add.graphics().setDepth(14)
      const pts = []
      for (let p = 0; p < 10; p++) {
        const a = (p * Math.PI / 5) - Math.PI / 2
        const r = p % 2 === 0 ? 10 : 5
        pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r)
      }
      g.fillStyle(color, 0.9)
      g.fillPoints(pts, true)
      g.lineStyle(2, 0xffffff, 0.5)
      g.strokePoints(pts, true)
      g.fillStyle(color, 0.2); g.fillCircle(x, y, 16)

      this.tweens.add({
        targets: g, y: -6, duration: 700 + Math.random() * 300,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })

      this.collectibles.push({ x, y, color, id, name, gfx: g, collected: false })
    })
  }

  // â”€â”€â”€ Particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _spawnParticles(x, y, color, lifespan, qty, spread = 60, speedY = -40) {
    try {
      this.add.particles(x, y, 'particle', {
        speed: { min: Math.abs(speedY) * 0.3, max: Math.abs(speedY) },
        angle: speedY < 0 ? { min: -110, max: -70 } : { min: 70, max: 110 },
        lifespan, quantity: 1, frequency: Math.max(30, lifespan / qty),
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: color,
        x: { min: -spread, max: spread },
      }).setDepth(5)
    } catch (e) { /* particles optional */ }
  }

  // â”€â”€â”€ Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')
    this.eKey = this.input.keyboard.addKey('E')
    this.iKey = this.input.keyboard.addKey('I')
    this.spaceKey = this.input.keyboard.addKey('SPACE')

    this.input.keyboard.on('keydown-E', () => this._tryInteract())
    this.input.keyboard.on('keydown-SPACE', () => this._tryInteract())
  }

  // â”€â”€â”€ Camera â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.0)
  }

  // â”€â”€â”€ HUD elements in-world â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _createHUD() {
    this.promptText = this.add.text(0, 0, '[E] Interact', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#000000cc', padding: { x: 6, y: 3 },
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(50).setVisible(false)
  }

  // â”€â”€â”€ Interaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _tryInteract() {
    // Speech bubble active: advance or close it
    if (this._speechBubble) { this._advanceSpeechBubble(); return }

    if (this.dialogueOpen || !this.nearestObj) return

    // NPC → in-world speech bubble
    if (this.nearestObj.type === 'npc') {
      this._openSpeechBubble(this.nearestObj)
      return
    }

    // Everything else → React dialogue card
    this.dialogueOpen = true
    this.player.setVelocity(0, 0)
    emit('showDialogue', {
      ...this.nearestObj,
      onClose: () => { this.dialogueOpen = false },
    })
  }

  // â”€â”€â”€ Update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  update(time, _delta) {
    if (!this.dialogueOpen) {
      this._handleMovement()
    }
    this._updateShadow()
    this._updateInteractionPrompt()
    this._checkZone()
    this._tickGateways()
    this._updateSpeechBubble()
    this._animatePromptBob(time)
  }

  _handleMovement() {
    if (!this.cursors || !this.player) return
    const { left, right, up, down } = this.cursors
    const { W, A, S, D } = this.wasd

    const goLeft  = left.isDown  || A.isDown
    const goRight = right.isDown || D.isDown
    const goUp    = up.isDown    || W.isDown
    const goDown  = down.isDown  || S.isDown

    let vx = goRight ? this.playerSpeed : goLeft ? -this.playerSpeed : 0
    let vy = goDown  ? this.playerSpeed : goUp   ? -this.playerSpeed : 0

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707
      vy *= 0.707
    }

    this.player.setVelocity(vx, vy)

    if (vx < 0)      this.player.setFlipX(true)
    else if (vx > 0) this.player.setFlipX(false)

    const moving = vx !== 0 || vy !== 0
    const curAnim = this.player.anims.currentAnim?.key
    if (moving  && curAnim !== 'player_walk') this.player.anims.play('player_walk')
    if (!moving && curAnim !== 'player_idle') this.player.anims.play('player_idle')
  }

  _updateShadow() {
    if (this._playerShadow) {
      this._playerShadow.setPosition(this.player.x, this.player.y + 14)
      this._playerShadow.setDepth(19)
    }
  }

  _updateInteractionPrompt() {
    const px = this.player.x, py = this.player.y
    let nearest = null, nearestDist = 85

    this.interactables.forEach(obj => {
      const d = Phaser.Math.Distance.Between(px, py, obj.x, obj.y)
      if (d < nearestDist) { nearestDist = d; nearest = obj }
    })

    this.nearestObj = nearest

    if (nearest) {
      this.promptText.setPosition(nearest.x, nearest.y - 46)
      this.promptText.setText(nearest.label || '[E] Interact')
      this.promptText.setVisible(true)
    } else {
      this.promptText.setVisible(false)
    }
  }

  _checkZone() {
    const px = this.player.x
    const py = this.player.y

    let zone = 'HUB'
    if      (py < ZY.HUB)             zone = 'TEMPLE'
    else if (py >= ZY.HUB + ZONE_H)   zone = 'TAVERN'
    else if (px < ZX.HUB)             zone = 'FORGE'
    else if (px >= ZX.HUB + ZONE_W)   zone = 'ARENA'
    else                               zone = 'HUB'

    if (zone !== this.currentZone) {
      this.currentZone = zone
      emit('zoneChange', { zone })
    }
  }

  _animatePromptBob(time) {
    if (this.promptText?.visible) {
      this.promptText.y += Math.sin(time * 0.004) * 0.4
    }
  }

  // ─── In-World Speech Bubble System ────────────────────────────────────────
  // NPC dialogue is shown as a Phaser-rendered speech bubble above the NPC,
  // with a typewriter text-reveal animation. All other dialogue types
  // (projects, skills, certs, about, experience, education) still use the
  // React overlay card system via emit('showDialogue').

  // Split long text into segments of roughly maxLen chars at word boundaries
  _splitDialogue(text, maxLen = 220) {
    const segs = []
    let rem = (text || '').trim()
    while (rem.length > maxLen) {
      let cut = rem.lastIndexOf(' ', maxLen)
      if (cut < 60) cut = maxLen
      segs.push(rem.slice(0, cut).trim())
      rem = rem.slice(cut).trim()
    }
    if (rem) segs.push(rem)
    return segs.length ? segs : ['...']
  }

  // Zone → bubble border / glow / name colour
  _bubbleStyle(zone) {
    const styles = {
      forge:  { border: 0xbb3300, glow: 0xff5500, nameCol: '#bb3300' },
      arena:  { border: 0xaa8800, glow: 0xffcc00, nameCol: '#9a7700' },
      temple: { border: 0x5522aa, glow: 0x9966ff, nameCol: '#5522aa' },
      tavern: { border: 0x7a3e10, glow: 0xcc8833, nameCol: '#7a3e10' },
      hub:    { border: 0x226622, glow: 0x44cc44, nameCol: '#226622' },
    }
    return styles[zone] || styles.hub
  }

  // Create and display a speech bubble above the given NPC interactable
  _openSpeechBubble(obj) {
    this._closeSpeechBubble()     // dismiss any existing bubble first

    const { npcName, text, zone } = obj.data
    const segments = this._splitDialogue(text)
    const sty      = this._bubbleStyle(zone)
    const NX = obj.x, NY = obj.y

    // Bubble geometry constants
    const BW     = 360   // total width
    const PAD    = 14    // inner padding
    const TAIL   = 18   // tail/pointer height below bubble body
    const NAME_H = 20   // name row height
    const SEP    = 6    // gap between name row and body text
    const BODY_H = 88   // body text area (fits ~4-5 wrapped lines at 12px)
    const HINT_H = 16   // "press E" hint row
    const BH = PAD + NAME_H + SEP + BODY_H + SEP + HINT_H + PAD  // ≈ 164

    this.dialogueOpen = true
    this.player.setVelocity(0, 0)

    // Container is anchored at the NPC's world position (0,0 = NPC centre)
    const cont = this.add.container(NX, NY).setDepth(55)

    // ── Graphics: glow halo, border, cream body fill, tail ─────────────────
    const g = this.add.graphics()

    // Soft glow behind the whole bubble (including tail region)
    g.fillStyle(sty.glow, 0.15)
    g.fillRoundedRect(-BW / 2 - 7, -(TAIL + BH) - 7, BW + 14, BH + 14, 16)

    // Tail border (solid zone colour)
    g.fillStyle(sty.border, 1)
    g.fillTriangle(-15, -TAIL + 1, 15, -TAIL + 1, 0, 3)

    // Bubble border rect (2px border via slightly larger fill)
    g.fillStyle(sty.border, 1)
    g.fillRoundedRect(-BW / 2 - 2, -(TAIL + BH) - 2, BW + 4, BH + 4, 12)

    // Cream body fill
    g.fillStyle(0xf6f2e8, 1)
    g.fillRoundedRect(-BW / 2, -(TAIL + BH), BW, BH, 10)

    // Tail cream fill (covers the tail border except the very tip)
    g.fillStyle(0xf6f2e8, 1)
    g.fillTriangle(-12, -TAIL + 2, 12, -TAIL + 2, 0, 0)

    // Subtle zone-colour tint over the name strip at the top
    g.fillStyle(sty.glow, 0.08)
    g.fillRect(-BW / 2, -(TAIL + BH), BW, PAD + NAME_H + SEP - 2)

    // Separator line under the name strip
    const sepY = -(TAIL + BH) + PAD + NAME_H + 2
    g.lineStyle(1, sty.border, 0.28)
    g.lineBetween(-BW / 2 + PAD + 2, sepY, BW / 2 - PAD - 2, sepY)

    cont.add(g)

    // ── NPC name (bold, zone-coloured) ──────────────────────────────────────
    cont.add(this.add.text(0, -(TAIL + BH) + PAD, npcName, {
      fontSize: '14px', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      color: sty.nameCol, align: 'center',
    }).setOrigin(0.5, 0))

    // ── Body text (typewriter target, word-wrapped, dark ink) ────────────────
    const bodyText = this.add.text(
      -BW / 2 + PAD,
      -(TAIL + BH) + PAD + NAME_H + SEP,
      '',
      {
        fontSize: '12px', fontFamily: 'monospace', color: '#1a160c',
        wordWrap: { width: BW - PAD * 2, useAdvancedWrap: true },
        lineSpacing: 4,
      }
    ).setOrigin(0, 0)
    cont.add(bodyText)

    // ── Page indicator  (only shown when >1 segment) ─────────────────────────
    const pageText = this.add.text(
      -BW / 2 + PAD, -TAIL - PAD + 2, '',
      { fontSize: '10px', fontFamily: 'monospace', color: '#998877' }
    ).setOrigin(0, 1).setVisible(segments.length > 1)
    cont.add(pageText)

    // ── "▼ Press E" hint (shown after typewriter finishes) ───────────────────
    const hintText = this.add.text(
      BW / 2 - PAD, -TAIL - PAD + 2, '▼ Press E',
      { fontSize: '10px', fontFamily: 'monospace', color: '#887866' }
    ).setOrigin(1, 1).setVisible(false)
    cont.add(hintText)

    // ── Store state ──────────────────────────────────────────────────────────
    this._speechBubble = {
      cont, segments, totalSegs: segments.length, segIndex: 0,
      bodyText, hintText, pageText,
      npcX: NX, npcY: NY,
      typing: false, revealed: 0, fullText: '', timer: null,
    }

    // Fade in, then start typewriter
    cont.setAlpha(0)
    this.tweens.add({
      targets: cont, alpha: 1, duration: 200, ease: 'Sine.easeOut',
      onComplete: () => this._startTypewriter(),
    })
  }

  // Begin (or restart) the typewriter effect for the current segment
  _startTypewriter() {
    const b = this._speechBubble
    if (!b) return

    const full = b.segments[b.segIndex]
    b.fullText  = full
    b.revealed  = 0
    b.typing    = true
    b.bodyText.setText('')
    b.hintText.setVisible(false)
    this.tweens.killTweensOf(b.hintText)
    b.hintText.setAlpha(1)

    if (b.totalSegs > 1) b.pageText.setText(`${b.segIndex + 1} / ${b.totalSegs}`)

    if (b.timer) { b.timer.remove(false); b.timer = null }

    b.timer = this.time.addEvent({
      delay: 30,       // ms per character (~33 chars/sec)
      loop: true,
      callback: () => {
        if (!b.typing) return
        b.revealed = Math.min(b.revealed + 1, b.fullText.length)
        b.bodyText.setText(b.fullText.slice(0, b.revealed))
        if (b.revealed >= b.fullText.length) {
          b.typing = false
          b.timer.remove(false); b.timer = null
          b.hintText.setVisible(true)
          this.tweens.add({
            targets: b.hintText, alpha: 0.22, yoyo: true, repeat: -1, duration: 560,
          })
        }
      },
    })
  }

  // Called when player presses E while a bubble is active
  _advanceSpeechBubble() {
    const b = this._speechBubble
    if (!b) return

    if (b.typing) {
      // Skip to end of current segment instantly
      b.typing = false
      b.timer?.remove(false); b.timer = null
      b.bodyText.setText(b.fullText)
      b.hintText.setVisible(true)
      this.tweens.add({ targets: b.hintText, alpha: 0.22, yoyo: true, repeat: -1, duration: 560 })
      return
    }

    b.segIndex++
    if (b.segIndex < b.segments.length) {
      this._startTypewriter()
    } else {
      this._closeSpeechBubble()
    }
  }

  // Fade out and destroy the active speech bubble
  _closeSpeechBubble() {
    const b = this._speechBubble
    if (!b) return
    this._speechBubble = null
    this.dialogueOpen  = false
    if (b.timer) { b.timer.remove(false); b.timer = null }
    this.tweens.killTweensOf(b.hintText)
    const cont = b.cont
    this.tweens.add({
      targets: cont, alpha: 0, duration: 180, ease: 'Sine.easeIn',
      onComplete: () => { try { cont.destroy() } catch (_) {} },
    })
  }

  // Called every frame — dismiss bubble if player walks too far from the NPC
  _updateSpeechBubble() {
    const b = this._speechBubble
    if (!b || !this.player) return
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, b.npcX, b.npcY
    )
    if (dist > 430) this._closeSpeechBubble()
  }

  // ─── Gateway Portal System ─────────────────────────────────────────────────
  // HYBRID approach:
  //   FORGE / ARENA  (vertical walls, player passes left/right):
  //     → Two tall vertical pillars at the TOP and BOTTOM of the door gap.
  //       They frame the opening like a monumental gateway.
  //   TEMPLE / TAVERN (horizontal walls, player passes up/down):
  //     → Classic full archway: left + right pillars + top lintel.
  //
  // All gateways spawn when the player enters a 380-pixel proximity radius
  // centred on the doorway, then fade out when the player moves away.

  _setupGateways() {
    const VT = SIDE_DOOR_T, VB = SIDE_DOOR_B     // 1550 / 2050 — vertical gap y-range
    const HL = HORIZ_DOOR_L, HR = HORIZ_DOOR_R   // 1550 / 2050 — horizontal gap x-range

    this._gatewayDefs = [
      // ── left wall (player walks east/west) ──────────────────────────────
      {
        id: 'forge',  zone: 'FORGE',
        name: 'THE GAME\nFORGE',   sub: 'Projects &\nCreations',
        cx: 1200, cy: 1800, orient: 'v', gA: VT, gB: VB,
        col: { bg: 0x160700, surface: 0x281200, border: 0xcc3300, hot: 0xff5500, accent: 0xff8800 },
        textCol: '#ff9955', ptCol: 0xff5500,
      },
      // ── right wall ──────────────────────────────────────────────────────
      {
        id: 'arena',  zone: 'ARENA',
        name: 'ACHIEVEMENT\nARENA', sub: 'Certificates\n& Awards',
        cx: 2400, cy: 1800, orient: 'v', gA: VT, gB: VB,
        col: { bg: 0x0e0900, surface: 0x1c1500, border: 0xcc9900, hot: 0xffdd00, accent: 0xffee66 },
        textCol: '#ffee88', ptCol: 0xffcc00,
      },
      // ── top wall (player walks north/south) ─────────────────────────────
      {
        id: 'temple', zone: 'TEMPLE',
        name: 'THE TECH\nTEMPLE',  sub: 'Skills &\nExpertise',
        cx: 1800, cy: 1200, orient: 'h', gA: HL, gB: HR,
        col: { bg: 0x060018, surface: 0x0c0030, border: 0x5522cc, hot: 0x8844ff, accent: 0xaa66ff },
        textCol: '#bb88ff', ptCol: 0x7744ff,
      },
      // ── bottom wall ─────────────────────────────────────────────────────
      {
        id: 'tavern', zone: 'TAVERN',
        name: 'QUEST LOG\nTAVERN', sub: 'Experience\n& Education',
        cx: 1800, cy: 2400, orient: 'h', gA: HL, gB: HR,
        col: { bg: 0x2c1600, surface: 0x3e2000, border: 0x8a5520, hot: 0xcc8833, accent: 0xffaa44 },
        textCol: '#ffcc77', ptCol: 0xffaa44,
      },
    ]

    this._gwState = {}
    for (const d of this._gatewayDefs) {
      this._gwState[d.id] = { active: false, container: null, timers: [] }
    }
  }

  _tickGateways() {
    if (!this.player) return
    const px = this.player.x, py = this.player.y
    const PROX = 380
    for (const def of this._gatewayDefs) {
      const dist = Phaser.Math.Distance.Between(px, py, def.cx, def.cy)
      const st   = this._gwState[def.id]
      if (dist < PROX && !st.active) {
        st.active = true;  this._spawnGateway(def, st)
      } else if (dist >= PROX && st.active) {
        st.active = false; this._collapseGateway(st)
      }
    }
  }

  _spawnGateway(def, st) {
    const c = this.add.container(0, 0).setDepth(14)
    st.container = c; c.setAlpha(0)
    switch (def.id) {
      case 'forge':  this._buildForgePillars(c, def, st);  break
      case 'arena':  this._buildArenaPillars(c, def, st);  break
      case 'temple': this._buildTempleGate(c, def, st);    break
      case 'tavern': this._buildTavernGate(c, def, st);    break
    }
    this.tweens.add({ targets: c, alpha: 1, duration: 380, ease: 'Sine.easeOut' })
  }

  _collapseGateway(st) {
    if (!st.container) return
    for (const t of st.timers) t?.remove(false)
    st.timers = []
    const c = st.container
    this.tweens.add({
      targets: c, alpha: 0, duration: 300, ease: 'Sine.easeIn',
      onComplete: () => { try { c.destroy() } catch (_) {} st.container = null },
    })
  }

  _gwGlowPulse(c, g, peakAlpha, duration) {
    c.add(g)
    this.tweens.add({ targets: g, alpha: peakAlpha, yoyo: true, repeat: -1, duration, ease: 'Sine.easeInOut' })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FORGE PILLARS — two tall iron monoliths framing the vertical gap
  // Top pillar above the door, bottom pillar below the door.
  // ══════════════════════════════════════════════════════════════════════════
  _buildForgePillars(c, def, st) {
    const { cx, gA, gB, col } = def   // gA=1550 top-of-gap, gB=2050 bottom-of-gap
    const PW  = 110   // pillar width  (±55 from cx)
    const PH  = PW / 2
    const PT  = 350   // pillar height
    const CW  = 138   // door-cap width at the gap edges (wider than pillar)
    const CH  = 32    // door-cap height
    const g   = this.add.graphics()

    // ── Helper: draw one iron pillar ───────────────────────────────────────
    const drawPillar = (py) => {
      // Dark iron body
      g.fillStyle(col.bg, 1);      g.fillRect(cx - PH, py, PW, PT)
      // Hammered metal surface panel
      g.fillStyle(col.surface, 1); g.fillRect(cx - PH + 8, py + 8, PW - 16, PT - 16)

      // Rivet dots along vertical edges
      g.fillStyle(col.bg, 0.85)
      for (let yy = py + 20; yy < py + PT - 12; yy += 28) {
        g.fillCircle(cx - PH + 13, yy, 4)
        g.fillCircle(cx + PH - 13, yy, 4)
      }
      // Hot-iron horizontal seam lines
      g.lineStyle(1.5, col.hot, 0.32)
      for (let yy = py + 18; yy < py + PT - 8; yy += 24) {
        g.lineBetween(cx - PH + 12, yy, cx + PH - 12, yy)
      }
      // Glowing border
      g.lineStyle(3, col.border, 0.90); g.strokeRect(cx - PH, py, PW, PT)
      g.lineStyle(2, col.hot,   0.52); g.strokeRect(cx - PH + 3, py + 3, PW - 6, PT - 6)
    }

    // Top pillar: above the gap (y goes from gA-PT upward to gA)
    drawPillar(gA - PT)
    // Bottom pillar: below the gap (y goes from gB downward to gB+PT)
    drawPillar(gB)

    // ── Flame-crown caps at very top of top pillar ─────────────────────────
    const crownY = gA - PT
    ;[-28, 0, 28].forEach(dx => {
      g.fillStyle(col.accent, 0.72)
      g.fillTriangle(cx + dx, crownY, cx + dx - 10, crownY - 18, cx + dx + 10, crownY - 18)
      g.fillStyle(col.hot, 0.45)
      g.fillTriangle(cx + dx, crownY, cx + dx - 6,  crownY - 11, cx + dx + 6,  crownY - 11)
    })

    // ── Door-cap bars at gap edges (wider decorative horizontal bars) ───────
    // Top cap (at y=gA, bottom of top pillar → top of opening)
    g.fillStyle(col.bg, 1);      g.fillRect(cx - CW / 2, gA - CH, CW, CH)
    g.fillStyle(col.surface, 1); g.fillRect(cx - CW / 2 + 6, gA - CH + 6, CW - 12, CH - 12)
    g.lineStyle(3, col.border, 0.90); g.strokeRect(cx - CW / 2, gA - CH, CW, CH)
    g.lineStyle(2, col.hot,   0.55); g.strokeRect(cx - CW / 2 + 3, gA - CH + 3, CW - 6, CH - 6)

    // Bottom cap (at y=gB, bottom of opening → top of bottom pillar)
    g.fillStyle(col.bg, 1);      g.fillRect(cx - CW / 2, gB, CW, CH)
    g.fillStyle(col.surface, 1); g.fillRect(cx - CW / 2 + 6, gB + 6, CW - 12, CH - 12)
    g.lineStyle(3, col.border, 0.90); g.strokeRect(cx - CW / 2, gB, CW, CH)
    g.lineStyle(2, col.hot,   0.55); g.strokeRect(cx - CW / 2 + 3, gB + 3, CW - 6, CH - 6)

    // Subtle warm atmosphere inside the gap itself
    g.fillStyle(col.hot, 0.04); g.fillRect(cx - CW / 2, gA, CW, gB - gA)
    c.add(g)

    // ── Zone name on the top pillar (lower third, near the door) ───────────
    c.add(this.add.text(cx, gA - 90, def.name, {
      fontSize: '13px', fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
      color: def.textCol, stroke: '#110200', strokeThickness: 5,
    }).setOrigin(0.5, 0.5))

    // ── Sub text on bottom pillar (upper third, near the door) ─────────────
    c.add(this.add.text(cx, gB + 90, def.sub, {
      fontSize: '11px', fontFamily: 'monospace', align: 'center',
      color: def.textCol, stroke: '#110200', strokeThickness: 4,
    }).setOrigin(0.5, 0.5))

    // ── Pulsing glow on both pillars and caps ──────────────────────────────
    const glowG = this.add.graphics()
    glowG.fillStyle(col.hot, 0.10)
    glowG.fillRect(cx - PH, gA - PT, PW, PT)     // top pillar
    glowG.fillRect(cx - PH, gB,      PW, PT)     // bottom pillar
    glowG.fillRect(cx - CW / 2, gA - CH, CW, CH) // top cap
    glowG.fillRect(cx - CW / 2, gB,      CW, CH) // bottom cap
    this._gwGlowPulse(c, glowG, 0.34, 1350)

    // ── Embers rise from the top of the top pillar ─────────────────────────
    const spawnEmber = () => {
      if (!st.active || !st.container) return
      const em = this.add.graphics()
      em.fillStyle(col.ptCol, 1)
      em.fillCircle(0, 0, 1.5 + Math.random() * 2)
      em.x = cx - PH + 10 + Math.random() * (PW - 20)
      em.y = gA - PT - 4
      c.add(em)
      this.tweens.add({
        targets: em, y: em.y - 44 - Math.random() * 46,
        x: em.x + (Math.random() - 0.5) * 34,
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 950 + Math.random() * 650,
        onComplete: () => { try { em.destroy() } catch (_) {} },
      })
    }
    st.timers.push(this.time.addEvent({ delay: 105, callback: spawnEmber, loop: true }))
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ARENA PILLARS — two tall golden monoliths framing the vertical gap
  // ══════════════════════════════════════════════════════════════════════════
  _buildArenaPillars(c, def, st) {
    const { cx, gA, gB, col } = def
    const PW  = 110, PH = PW / 2, PT = 350
    const CW  = 148, CH = 36
    const g   = this.add.graphics()

    // ── Helper: draw one golden pillar ─────────────────────────────────────
    const drawPillar = (py) => {
      // Dark velvet base
      g.fillStyle(col.bg, 1);  g.fillRect(cx - PH, py, PW, PT)
      // Inner dark-navy panel
      g.fillStyle(0x030610, 1); g.fillRect(cx - PH + 9, py + 9, PW - 18, PT - 18)
      // Gold inset frame (double line)
      g.lineStyle(4, col.hot, 1.0);     g.strokeRect(cx - PH, py, PW, PT)
      g.lineStyle(2, col.accent, 0.60); g.strokeRect(cx - PH + 5, py + 5, PW - 10, PT - 10)

      // Gold ornament bands at thirds
      ;[1/4, 1/2, 3/4].forEach(f => {
        const by = py + f * PT
        g.fillStyle(col.hot, 0.55)
        g.fillRect(cx - PH, by - 4, PW, 8)
        g.fillStyle(col.accent, 0.35)
        g.fillRect(cx - PH + 2, by - 2, PW - 4, 4)
      })

      // Corner bracket ornaments on each pillar face
      const bracket = (bx, by, sx, sy) => {
        g.fillStyle(col.hot, 1)
        g.fillRect(bx,           by,           sx * 14, sy * 3)
        g.fillRect(bx,           by,           sx * 3,  sy * 14)
        g.fillStyle(col.accent, 0.7)
        g.fillCircle(bx + sx * 2, by + sy * 2, 2.5)
      }
      bracket(cx - PH + 1, py + 1,            1,  1)
      bracket(cx + PH - 1, py + 1,           -1,  1)
      bracket(cx - PH + 1, py + PT - 1,       1, -1)
      bracket(cx + PH - 1, py + PT - 1,      -1, -1)
    }

    drawPillar(gA - PT)  // top pillar
    drawPillar(gB)       // bottom pillar

    // ── Trophy crown on top of the top pillar ─────────────────────────────
    const crownY = gA - PT
    ;[-1, 0, 1].forEach(i => {
      const tx = cx + i * 26, ty = crownY - 18
      g.fillStyle(col.hot, 0.82)
      g.fillRect(tx - 10, ty - 12, 20, 16)   // cup body
      g.fillRect(tx - 13, ty - 15, 4, 15)    // left handle
      g.fillRect(tx + 9,  ty - 15, 4, 15)    // right handle
      g.fillRect(tx - 4,  ty + 4,  8, 4)     // stem
      g.fillRect(tx - 10, ty + 8,  20, 4)    // base
      g.fillStyle(col.accent, 0.45)
      g.fillRect(tx - 7, ty - 10, 14, 10)    // cup highlight
    })

    // ── Door-cap bars ───────────────────────────────────────────────────────
    for (const [cy2, flip] of [[gA - CH, false], [gB, true]]) {
      g.fillStyle(col.bg, 1);   g.fillRect(cx - CW / 2, cy2, CW, CH)
      g.fillStyle(0x030610, 1); g.fillRect(cx - CW / 2 + 7, cy2 + 7, CW - 14, CH - 14)
      g.lineStyle(4, col.hot, 1.0);     g.strokeRect(cx - CW / 2, cy2, CW, CH)
      g.lineStyle(2, col.accent, 0.60); g.strokeRect(cx - CW / 2 + 4, cy2 + 4, CW - 8, CH - 8)
      // Corner gold L-brackets on cap
      const bracket2 = (bx, by, sx, sy) => {
        g.fillStyle(col.hot, 1)
        g.fillRect(bx, by, sx * 16, sy * 3); g.fillRect(bx, by, sx * 3, sy * 16)
      }
      bracket2(cx - CW / 2,     cy2,        1,  1)
      bracket2(cx + CW / 2,     cy2,       -1,  1)
      bracket2(cx - CW / 2,     cy2 + CH,   1, -1)
      bracket2(cx + CW / 2,     cy2 + CH,  -1, -1)
    }

    // Subtle gold atmosphere in gap
    g.fillStyle(col.hot, 0.025); g.fillRect(cx - CW / 2, gA, CW, gB - gA)
    c.add(g)

    // ── Zone name on top pillar ─────────────────────────────────────────────
    c.add(this.add.text(cx, gA - 90, def.name, {
      fontSize: '13px', fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
      color: def.textCol, stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 0.5))

    // ── Sub text on bottom pillar ───────────────────────────────────────────
    c.add(this.add.text(cx, gB + 90, def.sub, {
      fontSize: '11px', fontFamily: 'monospace', align: 'center',
      color: def.textCol, stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5))

    // ── Pulsing gold glow ──────────────────────────────────────────────────
    const glowG = this.add.graphics()
    glowG.fillStyle(col.hot, 0.08)
    glowG.fillRect(cx - PH, gA - PT, PW, PT)
    glowG.fillRect(cx - PH, gB,      PW, PT)
    glowG.fillRect(cx - CW / 2, gA - CH, CW, CH)
    glowG.fillRect(cx - CW / 2, gB,      CW, CH)
    this._gwGlowPulse(c, glowG, 0.28, 1700)

    // ── Sliding spotlight inside the gap ──────────────────────────────────
    const beamG = this.add.graphics()
    let beamY = gA
    const redrawBeam = () => {
      beamG.clear()
      beamG.fillStyle(col.hot, 0.06)
      beamG.fillRect(cx - CW / 2, beamY, CW, 80)
    }
    redrawBeam(); c.add(beamG)
    this.tweens.add({
      targets: { v: 0 }, v: 1, duration: 2800, repeat: -1, yoyo: true, ease: 'Sine.easeInOut',
      onUpdate: tw => { beamY = gA + tw.getValue() * (gB - gA - 80); redrawBeam() },
    })

    // ── Sparkle / confetti around the pillars ─────────────────────────────
    const spawnSparkle = () => {
      if (!st.active || !st.container) return
      const sp = this.add.graphics()
      sp.fillStyle(col.ptCol, 1)
      sp.fillRect(-3, -1, 6, 2); sp.fillRect(-1, -3, 2, 6)
      const zone = Math.random() < 0.5 ? 'top' : 'bot'
      sp.x = cx - PH - 5 + Math.random() * (PW + 10)
      sp.y = zone === 'top' ? gA - PT - 5 + Math.random() * (PT + 10) : gB - 5 + Math.random() * (PT + 10)
      c.add(sp)
      this.tweens.add({
        targets: sp, alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 500 + Math.random() * 400,
        onComplete: () => { try { sp.destroy() } catch (_) {} },
      })
    }
    st.timers.push(this.time.addEvent({ delay: 150, callback: spawnSparkle, loop: true }))
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TEMPLE ARCHWAY — left + right stone pillars + top lintel, animated runes
  // ══════════════════════════════════════════════════════════════════════════
  _buildTempleGate(c, def, st) {
    const { cx, cy, gA, gB, col } = def   // gA/gB are gap x-extents
    const PW = 62, PH = 130, LH = 70
    const g = this.add.graphics()

    // Left and right stone pillars
    g.fillStyle(col.bg, 1)
    g.fillRect(gA - PW, cy - PH, PW, PH * 2)
    g.fillRect(gB,      cy - PH, PW, PH * 2)
    g.fillStyle(col.surface, 0.75)
    g.fillRect(gA - PW + 6, cy - PH + 6, PW - 12, PH * 2 - 12)
    g.fillRect(gB + 6,      cy - PH + 6, PW - 12, PH * 2 - 12)

    // Stone mortar lines on pillars
    g.lineStyle(1, col.bg, 0.42)
    for (let yy = cy - PH + 22; yy < cy + PH; yy += 27) {
      g.lineBetween(gA - PW + 5, yy, gA - 5, yy)
      g.lineBetween(gB + 5,      yy, gB + PW - 5, yy)
    }
    // Rune marks at three heights on each pillar
    g.lineStyle(1.5, col.hot, 0.52)
    ;[cy - 74, cy, cy + 74].forEach(ry => {
      g.lineBetween(gA - PW + 11, ry - 5, gA - 11, ry - 5)
      g.lineBetween(gA - PW + 15, ry + 1, gA - 15, ry + 1)
      g.lineBetween(gA - PW + 11, ry + 7, gA - 11, ry + 7)
      g.lineBetween(gB + 11,      ry - 5, gB + PW - 11, ry - 5)
      g.lineBetween(gB + 15,      ry + 1, gB + PW - 15, ry + 1)
      g.lineBetween(gB + 11,      ry + 7, gB + PW - 11, ry + 7)
    })

    // Top lintel
    g.fillStyle(col.bg, 1)
    g.fillRect(gA - PW, cy - PH, gB - gA + PW * 2, LH)
    g.fillStyle(col.surface, 0.75)
    g.fillRect(gA - PW + 8, cy - PH + 8, gB - gA + PW * 2 - 16, LH - 16)

    // Glowing borders
    g.lineStyle(3, col.border, 0.88)
    g.strokeRect(gA - PW, cy - PH, PW, PH * 2)
    g.strokeRect(gB,      cy - PH, PW, PH * 2)
    g.strokeRect(gA - PW, cy - PH, gB - gA + PW * 2, LH)
    g.lineStyle(2, col.hot, 0.50)
    g.strokeRect(gA - PW + 4, cy - PH + 4, PW - 8, PH * 2 - 8)
    g.strokeRect(gB + 4,      cy - PH + 4, PW - 8, PH * 2 - 8)

    // Cap stones at pillar tops and bottoms
    g.fillStyle(col.border, 0.60)
    g.fillRect(gA - PW - 5, cy - PH - 5, PW + 10, 5)
    g.fillRect(gA - PW - 5, cy + PH,     PW + 10, 5)
    g.fillRect(gB - 5,      cy - PH - 5, PW + 10, 5)
    g.fillRect(gB - 5,      cy + PH,     PW + 10, 5)

    g.fillStyle(col.hot, 0.04); g.fillRect(gA, cy - PH + LH, gB - gA, PH * 2 - LH)
    c.add(g)

    // Animated rune line in lintel
    const runeG = this.add.graphics()
    let runePhase = 0
    const drawRunes = () => {
      runeG.clear()
      runeG.lineStyle(1.5, col.hot, 0.45 + Math.sin(runePhase) * 0.20)
      const lx = gA - PW + 14, ly = cy - PH + LH / 2, lw = gB - gA + PW * 2 - 28
      for (let xx = lx; xx < lx + lw; xx += 16) runeG.lineBetween(xx, ly, xx + 9, ly)
    }
    drawRunes(); c.add(runeG)
    st.timers.push(this.time.addEvent({
      delay: 80, loop: true, callback: () => { runePhase += 0.15; drawRunes() },
    }))

    // Zone name in lintel
    c.add(this.add.text(cx, cy - PH + LH / 2, def.name, {
      fontSize: '15px', fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
      color: def.textCol, stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5, 0.5))

    // Pulsing glow
    const glowG = this.add.graphics()
    glowG.fillStyle(col.hot, 0.12)
    glowG.fillRect(gA - PW, cy - PH, PW, PH * 2)
    glowG.fillRect(gB,      cy - PH, PW, PH * 2)
    glowG.fillRect(gA - PW, cy - PH, gB - gA + PW * 2, LH)
    this._gwGlowPulse(c, glowG, 0.38, 1600)

    // Wisps drifting outward from pillars
    const spawnWisp = (side) => {
      if (!st.active || !st.container) return
      const w = this.add.graphics()
      w.fillStyle(def.ptCol, 0.88); w.fillCircle(0, 0, 3 + Math.random() * 2)
      const bx = side === 'l' ? gA - PW / 2 : gB + PW / 2
      w.x = bx + (Math.random() - 0.5) * 18
      w.y = cy - PH + Math.random() * (PH * 2)
      c.add(w)
      const ang = (side === 'l' ? Math.PI : 0) + (Math.random() - 0.5) * 1.2
      this.tweens.add({
        targets: w, x: w.x + Math.cos(ang) * (22 + Math.random() * 28),
        y: w.y + Math.sin(ang) * (18 + Math.random() * 22),
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 1800 + Math.random() * 1200,
        onComplete: () => { try { w.destroy() } catch (_) {} },
      })
    }
    st.timers.push(
      this.time.addEvent({ delay: 230, callback: () => spawnWisp('l'), loop: true }),
      this.time.addEvent({ delay: 260, callback: () => spawnWisp('r'), loop: true, startAt: 120 }),
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAVERN ARCHWAY — warm wooden left + right pillars + top beam + lanterns
  // ══════════════════════════════════════════════════════════════════════════
  _buildTavernGate(c, def, st) {
    const { cx, cy, gA, gB, col } = def
    const PW = 60, PH = 120, LH = 66
    const g = this.add.graphics()

    // Wood pillars
    g.fillStyle(col.bg, 1)
    g.fillRect(gA - PW, cy - PH, PW, PH * 2)
    g.fillRect(gB,      cy - PH, PW, PH * 2)
    // Wood grain (vertical parallel lines)
    g.lineStyle(1, col.surface, 0.38)
    for (let xx = gA - PW + 8; xx < gA - 3; xx += 7) g.lineBetween(xx, cy - PH + 5, xx, cy + PH - 5)
    for (let xx = gB + 8; xx < gB + PW - 3; xx += 7)  g.lineBetween(xx, cy - PH + 5, xx, cy + PH - 5)

    // Iron reinforcing bands
    g.fillStyle(col.bg, 0.62)
    ;[-0.55, 0, 0.55].forEach(f => {
      const by = cy + f * PH
      g.fillRect(gA - PW, by - 4, PW, 8); g.fillRect(gB, by - 4, PW, 8)
    })

    // Top lintel (main beam)
    g.fillStyle(col.surface, 1); g.fillRect(gA - PW, cy - PH, gB - gA + PW * 2, LH)
    // Horizontal grain on lintel
    g.lineStyle(1, col.bg, 0.28)
    for (let yy = cy - PH + 8; yy < cy - PH + LH - 4; yy += 7) {
      g.lineBetween(gA - PW + 5, yy, gB + PW - 5, yy)
    }
    // Carved inner panel
    g.lineStyle(2, col.border, 0.70); g.strokeRect(gA - PW + 9, cy - PH + 9, gB - gA + PW * 2 - 18, LH - 18)
    // Notches on lintel edges
    g.fillStyle(col.bg, 0.52)
    for (let xx = gA - PW + 24; xx < gB + PW - 10; xx += 38) {
      g.fillRect(xx, cy - PH, 6, 8); g.fillRect(xx, cy - PH + LH - 8, 6, 8)
    }

    // Bottom threshold
    g.fillStyle(col.bg, 1); g.fillRect(gA - PW, cy + PH - 20, gB - gA + PW * 2, 20)
    g.lineStyle(2, col.border, 0.58); g.strokeRect(gA - PW, cy + PH - 20, gB - gA + PW * 2, 20)

    // Outer borders
    g.lineStyle(3, col.border, 0.85)
    g.strokeRect(gA - PW, cy - PH, PW, PH * 2)
    g.strokeRect(gB,      cy - PH, PW, PH * 2)
    g.strokeRect(gA - PW, cy - PH, gB - gA + PW * 2, LH)

    // Box lanterns on each pillar
    const drawLantern = (lx, ly) => {
      g.fillStyle(0x080600, 1);    g.fillRect(lx - 12, ly - 17, 24, 28)
      g.fillStyle(col.hot, 0.90);  g.fillRect(lx - 8,  ly - 13, 16, 20)
      g.lineStyle(2, col.border, 0.88); g.strokeRect(lx - 12, ly - 17, 24, 28)
      g.lineStyle(1, col.border, 0.52)
      g.lineBetween(lx, ly - 13, lx, ly + 7)
      g.lineBetween(lx - 8, ly - 3, lx + 8, ly - 3)
      g.lineStyle(2, col.border, 0.68); g.lineBetween(lx, ly - 17, lx, ly - 30)
      g.fillStyle(col.border, 1);      g.fillRect(lx - 5, ly - 32, 10, 4)
    }
    const lLx = gA - PW / 2, lRx = gB + PW / 2, lY = cy - 22
    drawLantern(lLx, lY); drawLantern(lRx, lY)

    g.fillStyle(col.hot, 0.022); g.fillRect(gA, cy - PH + LH, gB - gA, PH * 2 - LH - 20)
    c.add(g)

    // Lantern ambient glow
    const lgG = this.add.graphics()
    const drawLGlow = () => { lgG.clear(); lgG.fillStyle(col.hot, 0.22); lgG.fillCircle(lLx, lY, 28); lgG.fillCircle(lRx, lY, 28) }
    drawLGlow(); c.add(lgG)
    this.tweens.add({ targets: lgG, alpha: 0.44, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.easeInOut' })

    // Zone name in lintel
    c.add(this.add.text(cx, cy - PH + LH / 2, def.name, {
      fontSize: '15px', fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
      color: def.textCol, stroke: '#110700', strokeThickness: 5,
    }).setOrigin(0.5, 0.5))

    // Smoke from lanterns
    const spawnSmoke = (sx) => {
      if (!st.active || !st.container) return
      const sm = this.add.graphics()
      sm.fillStyle(0xccaa88, 0.20 + Math.random() * 0.12); sm.fillCircle(0, 0, 5 + Math.random() * 4)
      sm.x = sx + (Math.random() - 0.5) * 8; sm.y = lY - 35
      c.add(sm)
      this.tweens.add({
        targets: sm, y: sm.y - 30 - Math.random() * 26,
        x: sm.x + (Math.random() - 0.5) * 15,
        scaleX: 2.4, scaleY: 2.4, alpha: 0,
        duration: 1900 + Math.random() * 900,
        onComplete: () => { try { sm.destroy() } catch (_) {} },
      })
    }
    st.timers.push(
      this.time.addEvent({ delay: 370, callback: () => spawnSmoke(lLx), loop: true }),
      this.time.addEvent({ delay: 370, callback: () => spawnSmoke(lRx), loop: true, startAt: 185 }),
    )
  }
}
