/**
 * Phase 3: Red Screen to Black Screen
 * Handles the sequence from red screen through windows, weapons, last words, checkerboard,
 * then transitions to black for Phase 2
 */

import { startBlackSlime } from './blackSlime.js'

let windowsContainer = null
let weaponsContainer = null
let lastWordsContainer = null
let blendingImageContainer = null
let glitchyIconsContainer = null
let questionContainer = null
let checkerboardContainer = null
let endContainer = null

// Callback to notify when black screen transition is complete
let onBlackScreenComplete = null

export function setOnBlackScreenComplete(callback) {
  onBlackScreenComplete = callback
}

/**
 * Start Phase 3 - called after red screen appears
 */
export function startPhase3() {
  console.log('🔴 Starting Phase 3: Red to End...')

  // Remove Phase 1 and Phase 2 containers that might be blocking
  // NOTE: Do NOT remove 'red-screen-overlay' - it's the pixelated red background for Phase 3
  const previousPhaseContainers = [
    'blue-screen-canvas',
    'extras-spine-container',
    'justice-spine-container',
    'minefield-container',
    'drawing-container',
    'daggers-container',
    'black-glitch-canvas',
    'black-screen-overlay',
    'black-slime-container',
    'minesweeper-game',
    'mouse-trail-container',
    'text-explorer-container',
    'image-trash-container',
    'ascii-camera-container'
  ]
  previousPhaseContainers.forEach(id => {
    const el = document.getElementById(id)
    if (el) {
      console.log(`🗑️ Removing blocking element: ${id}`)
      el.remove()
    }
  })

  // Also remove any canvas elements that might be covering (without IDs)
  const allCanvases = document.querySelectorAll('canvas')
  allCanvases.forEach(canvas => {
    const zIndex = parseInt(window.getComputedStyle(canvas).zIndex) || 0
    if (zIndex > 0 && zIndex < 2500) {
      console.log(`🗑️ Removing canvas with z-index ${zIndex}`)
      canvas.remove()
    }
  })

  // Remove desktop files (README icons) that may be covering
  const desktopFiles = document.querySelectorAll('.desktop-file')
  desktopFiles.forEach(file => {
    console.log(`🗑️ Removing desktop file`)
    file.remove()
  })

  // 2 seconds after screen goes red
  setTimeout(startWindowsSequence, 2000)
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

function createContainer(id, zIndex) {
  // Always remove existing container to ensure fresh state
  let existing = document.getElementById(id)
  if (existing) {
    existing.remove()
  }

  const container = document.createElement('div')
  container.id = id
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: ${zIndex};
  `
  document.body.appendChild(container)
  console.log(`📦 Created container: ${id} with z-index ${zIndex}`)
  return container
}

// Phase 3 spine files are on a different part of a larger canvas
const PHASE3_X_OFFSET = 1730
const PHASE3_Y_OFFSET = 60

function spawnImage(data, container, offsetX = 0, offsetY = 0) {
  const img = document.createElement('img')
  img.src = data.path

  const canvasHeight = window.innerHeight

  // Apply X offset (phase 3 spine files start at ~2500px on original canvas)
  // Apply Y-flip for Spine coordinate system (Y increases upward in Spine, downward on screen)
  const left = data.x - PHASE3_X_OFFSET + offsetX
  const top = canvasHeight - (data.y - PHASE3_Y_OFFSET + offsetY)

  console.log(`📍 Spawning ${data.attachment} at (${left}, ${top}) from original (${data.x}, ${data.y})`)

  // Only show debug frames if NOT "spine the end"
  const debugStyle = data.origin === 'spine the end' ? '' : `
    background: rgba(255,0,255,0.3);
    border: 2px solid yellow;
  `

  img.style.cssText = `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
    transform: translate(-50%, -50%);
    ${debugStyle}
  `

  img.onerror = () => console.error(`❌ Failed to load image: ${data.path}`)
  img.onload = () => console.log(`✅ Loaded: ${data.path}`)

  container.appendChild(img)
  return img
}

function startPixelStutter(element) {
  const interval = setInterval(() => {
    if (!element.isConnected) {
      clearInterval(interval)
      return
    }
    const tx = (Math.random() - 0.5) * 4
    const ty = (Math.random() - 0.5) * 4
    element.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`
  }, 50)
}

async function startWindowsSequence() {
  console.log('🪟 Starting Windows Sequence...')
  const windowsData = await parseSpineFile('windows spine/Spine.json', 'windows')

  console.log('🪟 Windows data loaded:', windowsData.length, 'items')
  if (windowsData.length > 0) {
    console.log('🪟 First window:', windowsData[0])
  } else {
    console.error('🪟 No windows data loaded!')
  }

  // Sort by Y descending (highest Y first)
  windowsData.sort((a, b) => b.y - a.y)

  windowsContainer = createContainer('windows-container', 3666)
  // Debug: add visible border to container
  windowsContainer.style.border = '3px solid lime'

  const interval = 200
  windowsData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, windowsContainer)
    }, index * interval)
  })

  const totalDuration = windowsData.length * interval

  // 2 seconds after windows START appearing
  setTimeout(startWeaponsSequence, 2000)

  // After windows ALL appear
  setTimeout(startLastWordsSequence, totalDuration)
}

async function startWeaponsSequence() {
  console.log('⚔️ Starting Weapons Sequence...')
  const weaponsData = await parseSpineFile('weapons spine/Spine.json', 'weapons')
  shuffle(weaponsData)

  weaponsContainer = createContainer('weapons-container', 3700)

  weaponsData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, weaponsContainer)
    }, index * 150)
  })
}

async function startLastWordsSequence() {
  console.log('💬 Starting Last Words Sequence...')
  const wordsData = await parseSpineFile('last words spine/Spine.json', 'last-words')

  // Sort by Y descending
  wordsData.sort((a, b) => b.y - a.y)

  lastWordsContainer = createContainer('last-words-container', 3800)

  const interval = 300
  wordsData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, lastWordsContainer)
    }, index * interval)
  })

  // Second wave: 2 seconds later, shifted right
  setTimeout(() => {
    wordsData.forEach((data, index) => {
      setTimeout(() => {
        spawnImage(data, lastWordsContainer, 60, 0)
      }, index * interval)
    })
  }, 2000)

  const totalDuration = wordsData.length * interval

  // 2 seconds after start
  setTimeout(startColorBlendingImage, 2000)

  // 3 seconds after start
  setTimeout(startGlitchyIcons, 3000)

  // After all show up
  setTimeout(startQuestionSequence, totalDuration)
}

async function startColorBlendingImage() {
  console.log('🎨 Starting Color Blending Image...')
  const imageData = await parseSpineFile('image - color blending spine/Spine.json', 'blending-image')

  blendingImageContainer = createContainer('blending-image-container', 3699)
  // Apply blend mode to container so it blends with elements below
  blendingImageContainer.style.mixBlendMode = 'color'

  if (imageData.length > 0) {
    // Spawn 6 times (original + 5 more) with right offset
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const img = spawnImage(imageData[0], blendingImageContainer, i * 200, i * 360)
        img.style.opacity = '0.9'
      }, i * 150)
    }
  }
}

async function startGlitchyIcons() {
  console.log('📀 Starting Glitchy Icons...')
  const mineData = await parseSpineFile('last mine spine/Spine.json', 'last-mine')
  const dvdData = await parseSpineFile('dvd spine/Spine.json', 'dvd')

  const allData = [...mineData, ...dvdData]
  shuffle(allData)

  glitchyIconsContainer = createContainer('glitchy-icons-container', 3500)

  allData.forEach((data, index) => {
    setTimeout(() => {
      const img = spawnImage(data, glitchyIconsContainer)
      // startPixelStutter(img)
    }, index * 100)
  })
}

async function startQuestionSequence() {
  console.log('❓ Starting Question Sequence...')
  const questionData = await parseSpineFile('question spine/Spine.json', 'question')

  questionContainer = createContainer('question-container', 3100)

  const interval = 200
  questionData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, questionContainer)
    }, index * interval)
  })

  // Second sequence (shifted right and down, starting a bit later)
  const shiftOffset = 50
  const sequenceDelay = 800
  questionData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, questionContainer, shiftOffset, shiftOffset)
    }, index * interval + sequenceDelay)
  })

  const totalDuration = (questionData.length * interval) + sequenceDelay

  // // Start black slime after question marks complete
  // setTimeout(() => {
  //   console.log('🖤 Starting Black Slime after questions...')
  //   startBlackSlime()

    // After slime GIF ends (12 seconds), show black screen and transition to Phase 2
  //   setTimeout(() => {
  //     console.log('🖤 Slime complete, showing black screen...')
  //     showBlackScreenAndTransition()
  //   }, 12000)
  // }, totalDuration)

  setTimeout(startCheckerboardSequence, totalDuration)
}

async function startCheckerboardSequence() {
  console.log('🏁 Starting Checkerboard Sequence...')
  const checkerData = await parseSpineFile('checkerbord spine/Spine.json', 'checkerboard')

  checkerboardContainer = createContainer('checkerboard-container', 3650)

  checkerData.forEach((data, index) => {
    setTimeout(() => {
      spawnImage(data, checkerboardContainer)
    }, index * 100)
  })

  // Start "The End" sequence after checkerboard finishes appearing
  const totalDuration = checkerData.length * 100
  setTimeout(startTheEndSequence, totalDuration)
}

async function startTheEndSequence() {
  console.log('🔚 Starting The End Sequence...')
  const endData = await parseSpineFile('spine the end/Spine.json', 'spine the end')

  // Random order
  shuffle(endData)

  endContainer = createContainer('the-end-container', 4000)

  const interval = 150
  endData.forEach((data, index) => {
    setTimeout(() => {
      // Pass offsets to neutralize the Phase 3 global offset so images appear at their original coordinates
      spawnImage(data, endContainer, PHASE3_X_OFFSET, PHASE3_Y_OFFSET)
    }, index * interval)
  })

  const totalDuration = endData.length * interval

  // 4 seconds after the last one, turn screen black
  setTimeout(() => {
    console.log('🖤 The End complete, showing black screen...')
    showBlackScreenAndTransition()
  }, totalDuration + 4000)
}

/**
 * Show black screen overlay and trigger Phase 2 transition
 */
function showBlackScreenAndTransition() {
  console.log('🖤 Showing black screen...')

  // Create simple black overlay
  const blackOverlay = document.createElement('div')
  blackOverlay.id = 'black-screen-overlay'
  blackOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    z-index: 4100;
    pointer-events: none;
  `
  document.body.appendChild(blackOverlay)

  // Notify that black screen is complete
  if (onBlackScreenComplete) {
    onBlackScreenComplete()
  }
}

/**
 * Clean up Phase 3 resources
 */
export function cleanupPhase3() {
  if (windowsContainer) {
    windowsContainer.remove()
    windowsContainer = null
  }

  if (weaponsContainer) {
    weaponsContainer.remove()
    weaponsContainer = null
  }

  if (lastWordsContainer) {
    lastWordsContainer.remove()
    lastWordsContainer = null
  }

  if (blendingImageContainer) {
    blendingImageContainer.remove()
    blendingImageContainer = null
  }

  if (glitchyIconsContainer) {
    glitchyIconsContainer.remove()
    glitchyIconsContainer = null
  }

  if (questionContainer) {
    questionContainer.remove()
    questionContainer = null
  }

  if (checkerboardContainer) {
    checkerboardContainer.remove()
    checkerboardContainer = null
  }

  if (endContainer) {
    endContainer.remove()
    endContainer = null
  }

  const redOverlay = document.getElementById('red-screen-overlay')
  if (redOverlay) redOverlay.remove()
}
