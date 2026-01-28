/**
 * Phase 2: Black Screen (Final Phase)
 * Now the FINAL phase - comes after Phase 3
 * Handles the sequence from black screen through justice, minefield, daggers
 */

let justiceContainer = null
let minefieldContainer = null
let drawingContainer = null
let daggersContainer = null
let phase2AsciiContainer = null
let phase2Video = null
let phase2Canvas = null
let phase2Ctx = null
let phase2AnimationId = null
let phase2Stream = null
let phase2CameraActive = false

let onRedScreenComplete = null

export function setOnRedScreenComplete(callback) {
  onRedScreenComplete = callback
}

/**
 * Start Phase 2 - called after black screen is complete
 */
export function startPhase2() {
  console.log('🖤 Starting Phase 2: Black to Red Screen...')

  // Start the centered ASCII camera immediately
  startPhase2AsciiCamera()

  // 1 second after the screen is black, start the justice sequence
  setTimeout(() => {
    startJusticeSpine()
  }, 1000)
}

/**
 * Utility to shuffle an array
 * @param {Array} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

// ============================================
// Phase 2 ASCII Camera (larger, centered)
// ============================================

const P2_ASCII_CHARS = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '
let P2_WIDTH = 160  // Larger than phase 1
let P2_HEIGHT = 80
let p2EdgeTime = 0

function getP2ColorForBrightness(brightness) {
  // Red shades for black background phase
  if (brightness < 50) return '#330000'
  if (brightness < 100) return '#660000'
  if (brightness < 150) return '#990000'
  if (brightness < 200) return '#cc0000'
  return '#ff3333'
}

function getP2EdgeFade(x, y, width, height, time) {
  const edgeDist = 30
  const distFromLeft = x
  const distFromRight = width - 1 - x
  const distFromTop = y
  const distFromBottom = height - 1 - y
  const minDist = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom)

  const waveX = Math.sin(time * 0.002 + y * 0.15) * 4
  const waveY = Math.cos(time * 0.0015 + x * 0.12) * 4
  const organicDist = minDist + waveX + waveY

  if (organicDist >= edgeDist) return 1
  const fadeProb = Math.max(0, Math.pow(organicDist / edgeDist, 0.5))
  return Math.random() < fadeProb ? 1 : 0
}

/**
 * Start the Phase 2 ASCII camera (larger, centered)
 */
async function startPhase2AsciiCamera() {
  if (phase2CameraActive) return
  phase2CameraActive = true

  console.log('📷 Starting Phase 2 ASCII Camera (centered, large)...')

  // Calculate dimensions to fill screen
  // Courier New at 14px is approx 8.4px wide
  const charWidth = 8.4
  const charHeight = 14
  
  P2_WIDTH = Math.ceil(window.innerWidth / charWidth)
  P2_HEIGHT = Math.ceil(window.innerHeight / charHeight)

  phase2AsciiContainer = document.createElement('div')
  phase2AsciiContainer.id = 'phase2-ascii-camera'
  phase2AsciiContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2550;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1;
    letter-spacing: 0;
    white-space: pre;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s;
  `

  document.body.appendChild(phase2AsciiContainer)

  phase2Video = document.createElement('video')
  phase2Video.autoplay = true
  phase2Video.playsInline = true
  phase2Video.style.display = 'none'
  document.body.appendChild(phase2Video)

  phase2Canvas = document.createElement('canvas')
  phase2Canvas.width = P2_WIDTH
  phase2Canvas.height = P2_HEIGHT
  phase2Canvas.style.display = 'none'
  document.body.appendChild(phase2Canvas)
  phase2Ctx = phase2Canvas.getContext('2d')

  try {
    phase2Stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 800, height: 550 }
    })
    phase2Video.srcObject = phase2Stream
    await phase2Video.play()

    setTimeout(() => {
      if (phase2AsciiContainer) {
        phase2AsciiContainer.style.opacity = '0.9'
      }
    }, 100)

    renderPhase2ASCII()

  } catch (err) {
    console.error('Phase 2 Camera error:', err)
    phase2AsciiContainer.textContent = 'CAMERA\nACCESS\nDENIED'
    phase2AsciiContainer.style.opacity = '0.9'
  }
}

function renderPhase2ASCII() {
  if (!phase2CameraActive || !phase2Video || !phase2Video.srcObject) return

  p2EdgeTime++

  phase2Ctx.save()
  phase2Ctx.scale(-1, 1)
  phase2Ctx.drawImage(phase2Video, -P2_WIDTH, 0, P2_WIDTH, P2_HEIGHT)
  phase2Ctx.restore()

  const imageData = phase2Ctx.getImageData(0, 0, P2_WIDTH, P2_HEIGHT)
  const pixels = imageData.data

  let ascii = ''

  for (let y = 0; y < P2_HEIGHT; y++) {
    for (let x = 0; x < P2_WIDTH; x++) {
      if (getP2EdgeFade(x, y, P2_WIDTH, P2_HEIGHT, p2EdgeTime) === 0) {
        ascii += ' '
        continue
      }

      const i = (y * P2_WIDTH + x) * 4
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114)

      const charIndex = Math.floor((1 - brightness / 255) * (P2_ASCII_CHARS.length - 1))
      const char = P2_ASCII_CHARS[Math.max(0, Math.min(charIndex, P2_ASCII_CHARS.length - 1))]
      const color = getP2ColorForBrightness(brightness)

      ascii += `<span style="color:${color};text-shadow:0 0 2px ${color}">${char}</span>`
    }
    ascii += '\n'
  }

  phase2AsciiContainer.innerHTML = ascii
  phase2AnimationId = requestAnimationFrame(renderPhase2ASCII)
}

function stopPhase2AsciiCamera() {
  phase2CameraActive = false

  if (phase2AnimationId) {
    cancelAnimationFrame(phase2AnimationId)
    phase2AnimationId = null
  }

  if (phase2Stream) {
    phase2Stream.getTracks().forEach(track => track.stop())
    phase2Stream = null
  }

  if (phase2Video) {
    phase2Video.remove()
    phase2Video = null
  }

  if (phase2Canvas) {
    phase2Canvas.remove()
    phase2Canvas = null
  }

  if (phase2AsciiContainer) {
    phase2AsciiContainer.style.opacity = '0'
    setTimeout(() => {
      if (phase2AsciiContainer) {
        phase2AsciiContainer.remove()
        phase2AsciiContainer = null
      }
    }, 500)
  }
}

/**
 * Generic utility to parse a Spine JSON file.
 * @param {string} path - Path to the Spine JSON file.
 * @param {string} origin - A string to identify the origin of the spine data.
 * @returns {Promise<Array>} - A promise that resolves to an array of spine data objects.
 */
async function parseSpineFile(path, origin) {
  try {
    const response = await fetch(path)
    const spineJson = await response.json()

    const skin = spineJson.skins.default
    if (!skin) return []

    const folder = path.substring(0, path.lastIndexOf('/'))

    const spineData = spineJson.slots.map(slot => {
      const attachmentName = slot.attachment
      if (!skin[attachmentName] || !skin[attachmentName][attachmentName]) {
        return null
      }
      const skinAttachment = skin[attachmentName][attachmentName]

      return {
        origin: origin,
        attachment: attachmentName,
        path: `${folder}/${attachmentName}.png`,
        ...skinAttachment
      }
    }).filter(Boolean)

    return spineData
  } catch (e) {
    console.error(`Failed to parse spine file at ${path}:`, e)
    return []
  }
}

/**
 * Load and display justice spine images in a glitchy, random order.
 */
async function startJusticeSpine() {
  console.log('⚖️ Starting Justice Spine Sequence...')

  try {
    // Load Spine Data
    const response = await fetch('justice spine/Spine.json')
    const text = await response.text()

    const spineJson = JSON.parse(text)

    const spineData = spineJson.slots.map(slot => {
      const attachmentName = slot.attachment
      const skinAttachment = spineJson.skins.default[attachmentName][attachmentName]
      return {
        attachment: attachmentName,
        ...skinAttachment
      }
    })

    // Sort all slices from top to bottom based on their y-coordinate
    spineData.sort((a, b) => b.y - a.y)

    // Create container
    justiceContainer = document.createElement('div')
    justiceContainer.id = 'justice-spine-container'
    justiceContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2600;
      overflow: hidden;
    `
    document.body.appendChild(justiceContainer)

    // Spawn each image in the specified order with a glitchy delay
    const canvasHeight = window.innerHeight
    spineData.forEach((data, index) => {
      // Stagger the appearance
      const delay = index * 150; // Faster, more consistent appearance
      setTimeout(() => {
        spawnJusticeIcon(data, canvasHeight)
      }, delay)
    })

    // Schedule the minefield sequence
    setTimeout(() => {
      startMinefieldSequence()
    }, 100)

  } catch (e) {
    console.error('Failed to load justice spine:', e)
  }
}

/**
 * Spawn a single justice icon with a very glitchy appearance
 */
function spawnJusticeIcon(data, canvasHeight) {
  const el = document.createElement('div')
  const img = document.createElement('img')

  const imgPath = `justice spine/${data.attachment}.png`
  img.src = imgPath
  img.style.cssText = `
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
  `

  // Position is centered
  const targetX = data.x - data.width / 2
  const targetY = canvasHeight - data.y - data.height / 2

  el.style.cssText = `
    position: absolute;
    left: ${targetX}px;
    top: ${targetY}px;
    pointer-events: none;
    transform-origin: center;
  `

  el.appendChild(img)
  justiceContainer.appendChild(el)

  // Desktop-style glitch animation - smaller and more controlled
  const glitchDuration = 150 + Math.random() * 100 // shorter duration
  const glitchInterval = 50
  const glitchCount = glitchDuration / glitchInterval
  let glitchCounter = 0

  const glitchTimer = setInterval(() => {
    if (glitchCounter >= glitchCount) {
      clearInterval(glitchTimer)
      // Final state - no jitter, just clean
      img.style.opacity = '1'
      img.style.filter = ''
      img.style.transform = ''
      return
    }

    // Effects inspired by desktop icons - smaller movements
    const glitchEffects = [
      `translateX(${(Math.random() - 0.5) * 8}px) skewX(${(Math.random() - 0.5) * 20}deg)`,
      `translateY(${(Math.random() - 0.5) * 8}px) scaleX(${0.8 + Math.random() * 0.4})`,
      `translateX(${(Math.random() - 0.5) * 12}px) scaleY(${0.8 + Math.random() * 0.4})`,
      'translateX(0) translateY(0)'
    ]

    img.style.transform = glitchEffects[Math.floor(Math.random() * glitchEffects.length)]
    img.style.opacity = Math.random() > 0.3 ? '1' : '0.5'
    // Adding a more "pixely" feel with filter
    img.style.filter = Math.random() > 0.6 ? 'contrast(2) brightness(1.5)' : 'none'

    glitchCounter++
  }, glitchInterval)
}


/**
 * Starts the sequence to place reactive mines on the screen.
 */
async function startMinefieldSequence() {
  console.log('💣 Starting Minefield Sequence...')

  const mineSpine2Data = await parseSpineFile('mine spine 2/Spine.json', 'mine-spine-2')
  const otherMineData = await parseSpineFile('other mine/Spine.json', 'other-mine')

  let allMinesData = [...mineSpine2Data, ...otherMineData]

  shuffle(allMinesData)

  const maxDelay = 20 // 5 + 15
  const totalDuration = allMinesData.length * maxDelay

  allMinesData.forEach((mineData, index) => {
    const delay = index * (5 + Math.random() * 15)
    setTimeout(() => {
      spawnReactiveMine(mineData)
    }, delay)
  })

  setTimeout(() => {
    startDrawingAndDaggerSequence()
  }, totalDuration)
}

/**
 * Spawns a single reactive mine on the screen.
 * @param {object} data - The spine data for the mine.
 */
function spawnReactiveMine(data) {
  if (!minefieldContainer) {
    minefieldContainer = document.createElement('div')
    minefieldContainer.id = 'minefield-container'
    minefieldContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2700;
    `
    document.body.appendChild(minefieldContainer)
  }

  const tile = document.createElement('div')
  tile.dataset.origin = data.origin // Set the origin
  const canvasHeight = window.innerHeight

  // Center-based position
  const left = data.x
  const top = canvasHeight - data.y

  tile.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${data.width}px;
    height: ${data.height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    cursor: pointer;
    transition: transform 0.2s ease;
    transform: translate(-50%, -50%);
    background-image: url('${data.path}');
    background-size: contain;
    background-repeat: no-repeat;
  `

  tile.onmouseenter = () => tile.style.transform = 'translate(-50%, -50%) scale(1.1)'
  tile.onmouseleave = () => tile.style.transform = 'translate(-50%, -50%) scale(1)'

  tile.onclick = () => {
    // On click, show a random number like in the original minesweeper
    tile.style.backgroundImage = 'none'
    tile.style.backgroundColor = '#d0d0d0'
    tile.style.border = '1px solid #808080'

    const num = Math.floor(Math.random() * 4) // 0-3
    if (num > 0) {
      const colors = ['', '#0000ff', '#008000', '#ff0000']
      tile.style.color = colors[num] || 'black'
      tile.style.fontWeight = 'bold'
      tile.style.fontSize = Math.min(data.width, data.height) * 0.8 + 'px'
      tile.style.fontFamily = "'VT323', monospace"
      tile.textContent = num
    }

    // Make it non-interactive after click
    tile.onclick = null
    tile.onmouseenter = null
    tile.onmouseleave = null
    tile.style.cursor = 'default'
  }

  minefieldContainer.appendChild(tile)
}

/**
 * Spawns the image from the drawing spine.
 * @param {object} data - The spine data for the drawing.
 */
function spawnDrawingImage(data) {
  if (!drawingContainer) {
    drawingContainer = document.createElement('div')
    drawingContainer.id = 'drawing-container'
    drawingContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2650;
    `
    document.body.appendChild(drawingContainer)
  }

  const img = document.createElement('img')
  img.src = data.path
  const canvasHeight = window.innerHeight

  const left = data.x - data.width / 2
  const top = canvasHeight - data.y - data.height / 2

  img.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
  `

  drawingContainer.appendChild(img)
}

/**
 * Spawns a dagger image.
 * @param {object} data - The spine data for the dagger.
 */
function spawnDaggerImage(data) {
  if (!daggersContainer) {
    daggersContainer = document.createElement('div')
    daggersContainer.id = 'daggers-container'
    daggersContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2800;
    `
    document.body.appendChild(daggersContainer)
  }

  const img = document.createElement('img')
  img.src = data.path
  const canvasHeight = window.innerHeight

  const left = data.x - data.width / 2
  const top = canvasHeight - data.y - data.height / 2

  img.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
  `

  daggersContainer.appendChild(img)
}

/**
 * Starts the sequence of drawing, removing mines, and adding daggers.
 */
async function startDrawingAndDaggerSequence() {
  console.log('🔪 Starting Drawing and Dagger Sequence...')

  // 1. Spawn the drawing image
  const drawingData = await parseSpineFile('drawing spine/Spine.json')
  if (drawingData.length > 0) {
    spawnDrawingImage(drawingData[0])
  }

  // 2. Get mines to remove and daggers to add
  const otherMines = Array.from(document.querySelectorAll('[data-origin="other-mine"]'))
  const daggersData = await parseSpineFile('daggers spine 2/Spine.json')

  shuffle(otherMines)
  shuffle(daggersData)

  // 3. Start the simultaneous removal and addition
  const interval = 10 // ms between each swap (very fast)
  const minesPerTick = 6 // remove multiple mines at once
  const daggersPerTick = 3 // add multiple daggers at once
  let mineIndex = 0
  let daggerIndex = 0

  const loop = setInterval(() => {
    if (mineIndex >= otherMines.length && daggerIndex >= daggersData.length) {
      clearInterval(loop)
      // Phase 2 complete
      console.log('🔪 Daggers sequence complete')
      
      // Transition to Red Screen for Phase 3
      setTimeout(startRedPixelatedTransition, 2000)
      return
    }

    // Remove multiple mines per tick
    for (let i = 0; i < minesPerTick; i++) {
      if (mineIndex < otherMines.length) {
        const mineToRemove = otherMines[mineIndex]
        mineToRemove.remove()
        mineIndex++
      }
    }

    // Add multiple daggers per tick
    for (let i = 0; i < daggersPerTick; i++) {
      if (daggerIndex < daggersData.length) {
        const daggerToAdd = daggersData[daggerIndex]
        spawnDaggerImage(daggerToAdd)
        daggerIndex++
      }
    }
  }, interval)
}

/**
 * Transition to red/black pixelated background (like Phase 1 blue screen but red)
 */
function startRedPixelatedTransition() {
  const canvas = document.createElement('canvas')
  canvas.id = 'red-screen-overlay' // ID expected by Phase 3
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3000;
  `
  document.body.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const targetColor = '#400000'
  const pixelSize = 12
  const cols = Math.ceil(canvas.width / pixelSize)
  const rows = Math.ceil(canvas.height / pixelSize)
  const totalPixels = cols * rows

  const pixels = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pixels.push({ x, y })
    }
  }

  // Shuffle
  for (let i = pixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pixels[i], pixels[j]] = [pixels[j], pixels[i]]
  }

  const duration = 1000
  const pixelsPerFrame = Math.ceil(totalPixels / (duration / 16))
  let currentIndex = 0

  function fillPixels() {
    const batchSize = Math.max(1, Math.floor(pixelsPerFrame * (0.5 + Math.random() * 2)))

    for (let i = 0; i < batchSize && currentIndex < pixels.length; i++) {
      const pixel = pixels[currentIndex]
      
      // Red and Black mix
      const isBlack = Math.random() > 0.85
      ctx.fillStyle = isBlack ? '#000000' : targetColor

      const sizeVariation = Math.random() > 0.8 ? pixelSize * (0.5 + Math.random()) : pixelSize
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, sizeVariation, sizeVariation)
      currentIndex++
    }

    if (currentIndex < pixels.length) {
      requestAnimationFrame(fillPixels)
    } else {
      // Start glitch effect
      startRedScreenGlitch(canvas, ctx, cols, rows, pixelSize, targetColor)
      
      if (onRedScreenComplete) {
        onRedScreenComplete()
      }
    }
  }
  
  requestAnimationFrame(fillPixels)
}

function startRedScreenGlitch(canvas, ctx, cols, rows, pixelSize, baseColor) {
  const glitchColors = ['#400000', '#500000', '#300000', '#600000', '#000000', '#200000']

  function drawGlitch() {
    if (!canvas.isConnected) return

    const glitchCount = 5 + Math.floor(Math.random() * 15)

    for (let i = 0; i < glitchCount; i++) {
      const x = Math.floor(Math.random() * cols) * pixelSize
      const y = Math.floor(Math.random() * rows) * pixelSize
      const w = (1 + Math.floor(Math.random() * 8)) * pixelSize
      const h = (1 + Math.floor(Math.random() * 3)) * pixelSize

      ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)]
      ctx.fillRect(x, y, w, h)
    }

    if (Math.random() > 0.7) {
      const scanY = Math.floor(Math.random() * rows) * pixelSize
      ctx.fillStyle = Math.random() > 0.5 ? '#500000' : '#000000'
      ctx.fillRect(0, scanY, canvas.width, pixelSize * 2)
    }

    setTimeout(drawGlitch, 50 + Math.random() * 150)
  }

  drawGlitch()
}

/**
 * Clean up Phase 2 resources
 */
export function cleanupPhase2() {
  // Stop the ASCII camera
  stopPhase2AsciiCamera()

  if (justiceContainer) {
    justiceContainer.remove()
    justiceContainer = null
  }

  if (minefieldContainer) {
    minefieldContainer.remove()
    minefieldContainer = null
  }

  if (drawingContainer) {
    drawingContainer.remove()
    drawingContainer = null
  }

  if (daggersContainer) {
    daggersContainer.remove()
    daggersContainer = null
  }

  const blackCanvas = document.getElementById('black-glitch-canvas')
  if (blackCanvas) blackCanvas.remove()

  const blackOverlay = document.getElementById('black-screen-overlay')
  if (blackOverlay) blackOverlay.remove()
}
