/**
 * Chaos Sequence Module
 * Orchestrates the glitchy sequence of events when an icon is clicked after the icon glitch
 */

import { startMouseTrail } from './mouseTrail.js'
import { startDesktopAsciiCamera } from './desktopCamera.js'
import { startImageTrash } from './imageTrash.js'
import { startMinesweeperGame } from './minesweeper.js'
import { startTextExplorer } from './textExplorer.js'

let isSequenceActive = false
let mouseJitterInterval = null
let extrasContainer = null
let blackScreenScheduled = false
let blackScreenTimeoutId = null
let windowsContainer = null
let weaponsContainer = null
let lastWordsContainer = null
let blendingImageContainer = null
let glitchyIconsContainer = null
let questionContainer = null
let checkerboardContainer = null
let redOverlay = null

export function isChaosSequenceActive() {
  return isSequenceActive
}

/**
 * Start the chaos sequence
 */
export async function startChaosSequence() {
  if (isSequenceActive) return
  isSequenceActive = true
  
  console.log('🌀 Starting Chaos Sequence...')
  
  // Start background transition immediately
  startPixelatedBackgroundTransition()
  
  // Start unwanted mouse movements
  startUnwantedMouseMovements()
  
  // Sequence of events with delays
  const sequence = [
    { name: 'Mouse Trail', fn: startMouseTrail, delay: 800 },
    { name: 'ASCII Camera', fn: startDesktopAsciiCamera, delay: 2500 },
    { name: 'Image Trash', fn: startImageTrash, delay: 3000 },
    { name: 'Minesweeper', fn: startMinesweeperGame, delay: 2800 },
    { name: 'Text Explorer', fn: startTextExplorer, delay: 3200 },
    { name: 'Extras Spine', fn: startExtrasSpine, delay: 3500 },
  ]
  
  let totalDelay = 0
  for (const step of sequence) {
    totalDelay += step.delay
    setTimeout(() => {
      console.log(`🎯 Triggering: ${step.name}`)
      step.fn()
    }, totalDelay)
  }
}

/**
 * Transition desktop background to solid #000A5D in a pixelated glitchy way
 */
function startPixelatedBackgroundTransition() {
  const desktop = document.getElementById('desktop')
  if (!desktop) return
  
  // Create overlay canvas
  const canvas = document.createElement('canvas')
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  `
  desktop.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const targetColor = '#000A5D'
  const pixelSize = 12 // Larger blocks for more glitchy look
  const cols = Math.ceil(canvas.width / pixelSize)
  const rows = Math.ceil(canvas.height / pixelSize)
  const totalPixels = cols * rows
  
  // Create array of all pixel positions
  const pixels = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pixels.push({ x, y, filled: false })
    }
  }
  
  // Shuffle pixels for random glitchy fill
  for (let i = pixels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pixels[i], pixels[j]] = [pixels[j], pixels[i]]
  }
  
  // Fill pixels over time
  const duration = 2000 // 2 seconds (faster)
  const pixelsPerFrame = Math.ceil(totalPixels / (duration / 16)) // 60fps
  
  let currentIndex = 0
  
  function fillPixels() {
    // Fill multiple pixels per frame with very glitchy speed variations
    const batchSize = Math.max(1, Math.floor(pixelsPerFrame * (0.5 + Math.random() * 2))) // More glitchy variations
    
    for (let i = 0; i < batchSize && currentIndex < pixels.length; i++) {
      const pixel = pixels[currentIndex]
      ctx.fillStyle = targetColor
      
      // Random size variation for glitchy effect
      const sizeVariation = Math.random() > 0.8 ? pixelSize * (0.5 + Math.random()) : pixelSize
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, sizeVariation, sizeVariation)
      pixel.filled = true
      currentIndex++
    }
    
    if (currentIndex < pixels.length) {
      requestAnimationFrame(fillPixels)
    } else {
      // Transition complete - set solid background (use 'background' to override CSS gradient)
      desktop.style.background = targetColor
      // Keep the canvas for additional glitchy static effect
      startBlueScreenGlitch(canvas, ctx, cols, rows, pixelSize, targetColor)
    }
  }
  
  requestAnimationFrame(fillPixels)
}

/**
 * Keep the blue screen glitchy with ongoing random pixel noise
 */
function startBlueScreenGlitch(canvas, ctx, cols, rows, pixelSize, baseColor) {
  const glitchColors = ['#000A5D', '#0015A3', '#001177', '#000833', '#0000FF', '#000044']
  
  function drawGlitch() {
    // Draw random glitch rectangles
    const glitchCount = 5 + Math.floor(Math.random() * 15)
    
    for (let i = 0; i < glitchCount; i++) {
      const x = Math.floor(Math.random() * cols) * pixelSize
      const y = Math.floor(Math.random() * rows) * pixelSize
      const w = (1 + Math.floor(Math.random() * 8)) * pixelSize
      const h = (1 + Math.floor(Math.random() * 3)) * pixelSize
      
      // Random glitch color
      ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)]
      ctx.fillRect(x, y, w, h)
    }
    
    // Sometimes add horizontal scan lines
    if (Math.random() > 0.7) {
      const scanY = Math.floor(Math.random() * rows) * pixelSize
      ctx.fillStyle = Math.random() > 0.5 ? '#0022AA' : '#000033'
      ctx.fillRect(0, scanY, canvas.width, pixelSize * 2)
    }
    
    // Sometimes flash small areas back to base color
    if (Math.random() > 0.6) {
      const resetCount = 2 + Math.floor(Math.random() * 5)
      ctx.fillStyle = baseColor
      for (let i = 0; i < resetCount; i++) {
        const x = Math.floor(Math.random() * cols) * pixelSize
        const y = Math.floor(Math.random() * rows) * pixelSize
        ctx.fillRect(x, y, pixelSize * 3, pixelSize * 2)
      }
    }
    
    // Keep glitching
    setTimeout(drawGlitch, 50 + Math.random() * 150)
  }
  
  drawGlitch()
}

async function startRedSequence() {
    console.log('🔴 Starting Red Screen Sequence...');
    
    redOverlay = document.createElement('div');
    redOverlay.id = 'red-screen-overlay';
    redOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #400000; /* Dark Red */
        z-index: 2500;
        pointer-events: none;
    `;
    document.body.appendChild(redOverlay);

    // 2 seconds after screen goes red
    setTimeout(startWindowsSequence, 2000);
}

async function startWindowsSequence() {
    console.log('🪟 Starting Windows Sequence...');
    const windowsData = await parseSpineFile('windows spine/Spine.json', 'windows');
    
    // Sort by Y descending (highest Y first)
    windowsData.sort((a, b) => b.y - a.y);

    windowsContainer = createContainer('windows-container', 2600);
    
    const interval = 200;
    windowsData.forEach((data, index) => {
        setTimeout(() => {
            spawnImage(data, windowsContainer);
        }, index * interval);
    });
    
    const totalDuration = windowsData.length * interval;

    // 2 seconds after windows START appearing
    setTimeout(startWeaponsSequence, 2000);

    // After windows ALL appear
    setTimeout(startLastWordsSequence, totalDuration);
}

async function startWeaponsSequence() {
    console.log('⚔️ Starting Weapons Sequence...');
    const weaponsData = await parseSpineFile('weapons spine/Spine.json', 'weapons');
    shuffle(weaponsData);

    weaponsContainer = createContainer('weapons-container', 2700);
    
    weaponsData.forEach((data, index) => {
        setTimeout(() => {
            spawnImage(data, weaponsContainer);
        }, index * 150);
    });
}

async function startLastWordsSequence() {
    console.log('💬 Starting Last Words Sequence...');
    const wordsData = await parseSpineFile('last words spine/Spine.json', 'last-words');
    
    // Sort by Y descending
    wordsData.sort((a, b) => b.y - a.y);

    lastWordsContainer = createContainer('last-words-container', 2800);
    
    const interval = 300;
    wordsData.forEach((data, index) => {
        setTimeout(() => {
            spawnImage(data, lastWordsContainer);
        }, index * interval);
    });

    const totalDuration = wordsData.length * interval;

    // 2 seconds after start
    setTimeout(startColorBlendingImage, 2000);

    // 3 seconds after start
    setTimeout(startGlitchyIcons, 3000);

    // After all show up
    setTimeout(startQuestionSequence, totalDuration);
}

async function startColorBlendingImage() {
    console.log('🎨 Starting Color Blending Image...');
    const imageData = await parseSpineFile('image - color blending spine/Spine.json', 'blending-image');
    
    blendingImageContainer = createContainer('blending-image-container', 2900);

    if (imageData.length > 0) {
        const img = spawnImage(imageData[0], blendingImageContainer);
        img.style.mixBlendMode = 'color';
    }
}

async function startGlitchyIcons() {
    console.log('📀 Starting Glitchy Icons...');
    const mineData = await parseSpineFile('last mine spine/Spine.json', 'last-mine');
    const dvdData = await parseSpineFile('dvd spine/Spine.json', 'dvd');
    
    const allData = [...mineData, ...dvdData];
    shuffle(allData);

    glitchyIconsContainer = createContainer('glitchy-icons-container', 3000);

    allData.forEach((data, index) => {
        setTimeout(() => {
            const img = spawnImage(data, glitchyIconsContainer);
            startPixelStutter(img);
        }, index * 100);
    });
}

async function startQuestionSequence() {
    console.log('❓ Starting Question Sequence...');
    const questionData = await parseSpineFile('question spine/Spine.json', 'question');
    
    questionContainer = createContainer('question-container', 3100);
    
    const interval = 200;
    questionData.forEach((data, index) => {
        setTimeout(() => {
            spawnImage(data, questionContainer);
        }, index * interval);
    });

    const totalDuration = questionData.length * interval;
    setTimeout(startCheckerboardSequence, totalDuration);
}

async function startCheckerboardSequence() {
    console.log('🏁 Starting Checkerboard Sequence...');
    const checkerData = await parseSpineFile('checkerbord spine/Spine.json', 'checkerboard');
    
    checkerboardContainer = createContainer('checkerboard-container', 3200);
    
    checkerData.forEach((data, index) => {
        setTimeout(() => {
            spawnImage(data, checkerboardContainer);
        }, index * 100);
    });
}

function createContainer(id, zIndex) {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${zIndex};
        `;
        document.body.appendChild(container);
    }
    return container;
}

function spawnImage(data, container) {
    const img = document.createElement('img');
    img.src = data.path;

    const left = data.x;
    const top = data.y;

    img.style.cssText = `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: ${data.width}px;
        height: ${data.height}px;
        object-fit: contain;
        transform: translate(-50%, -50%);
    `;
    
    container.appendChild(img);
    return img;
}

function startPixelStutter(element) {
    const interval = setInterval(() => {
        if (!element.isConnected) {
            clearInterval(interval);
            return;
        }
        const tx = (Math.random() - 0.5) * 4;
        const ty = (Math.random() - 0.5) * 4;
        element.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
    }, 50);
}

/**
 * Make the mouse cursor move unwantedly every couple of seconds
 */
function startUnwantedMouseMovements() {
  // Create invisible element that we'll move the cursor to
  const fakeCursor = document.createElement('div')
  fakeCursor.style.cssText = `
    position: fixed;
    width: 1px;
    height: 1px;
    pointer-events: none;
    opacity: 0;
  `
  document.body.appendChild(fakeCursor)
  
  function triggerRandomMove() {
    // Random position
    const x = Math.random() * window.innerWidth
    const y = Math.random() * window.innerHeight
    
    // Dispatch mouse events to simulate movement
    // This creates a glitchy jump effect
    const duration = 200 + Math.random() * 300 // 200-500ms
    const steps = 8
    const startX = window.lastMouseX || window.innerWidth / 2
    const startY = window.lastMouseY || window.innerHeight / 2
    
    let step = 0
    const moveInterval = setInterval(() => {
      step++
      const progress = step / steps
      
      // Glitchy easing (sudden jumps)
      const t = progress < 0.7 ? progress * 0.3 : 0.3 + (progress - 0.7) * 2.33
      
      const currentX = startX + (x - startX) * t
      const currentY = startY + (y - startY) * t
      
      // Dispatch mouse move event
      const event = new MouseEvent('mousemove', {
        clientX: currentX,
        clientY: currentY,
        bubbles: true,
        cancelable: true,
        view: window
      })
      
      document.dispatchEvent(event)
      window.lastMouseX = currentX
      window.lastMouseY = currentY
      
      if (step >= steps) {
        clearInterval(moveInterval)
      }
    }, duration / steps)
  }
  
  // Track real mouse position
  document.addEventListener('mousemove', (e) => {
    window.lastMouseX = e.clientX
    window.lastMouseY = e.clientY
  })
  
  // Trigger random moves every 2-4 seconds
  mouseJitterInterval = setInterval(() => {
    triggerRandomMove()
  }, 2000 + Math.random() * 2000)
}

/**
 * Load and display extras spine icons in a glitchy unorganized way
 */
async function startExtrasSpine() {
  console.log('🎨 Starting Extras Spine...')
  
  try {
    // Load Spine Data
    const response = await fetch('extras spine/Spine.json')
    const text = await response.text()
    
    // Parse similar to other spine modules
    const slotsMatch = text.match(/"slots"\s*:\s*\[([\s\S]*?)\]/)
    const slotsContent = slotsMatch ? slotsMatch[1] : ''
    
    const attachmentRegex = /"attachment"\s*:"([^"]+)"/g
    let match
    const attachments = []
    while ((match = attachmentRegex.exec(slotsContent)) !== null) {
      attachments.push(match[1])
    }
    
    // Extract coordinates
    const coordRegex = /"x"\s*:\s*([\d\.-]+)\s*,\s*"y"\s*:\s*([\d\.-]+)\s*(\s*,\s*"width"\s*:\s*(\d+)\s*,\s*"height"\s*:\s*(\d+))?/g
    const skinsStart = text.indexOf('"skins"')
    const skinsText = skinsStart > -1 ? text.substring(skinsStart) : text
    
    const coords = []
    while ((match = coordRegex.exec(skinsText)) !== null) {
      coords.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
        width: match[4] ? parseFloat(match[4]) : 64,
        height: match[5] ? parseFloat(match[5]) : 64
      })
    }
    
    // Combine them
    const spineData = []
    const count = Math.min(attachments.length, coords.length)
    for (let i = 0; i < count; i++) {
      spineData.push({
        ...coords[i],
        attachment: attachments[i]
      })
    }
    
    // Create container
    extrasContainer = document.createElement('div')
    extrasContainer.id = 'extras-spine-container'
    extrasContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1900;
      overflow: hidden;
    `
    document.body.appendChild(extrasContainer)
    
    // Spawn each icon one after another in a glitchy way
    const canvasHeight = window.innerHeight
    
    for (let i = 0; i < spineData.length; i++) {
      setTimeout(() => {
        spawnExtrasIcon(spineData[i], canvasHeight)
      }, i * (50 + Math.random() * 80)) // 50-130ms between each icon (much faster!)
    }
    
  } catch (e) {
    console.error('Failed to load extras spine:', e)
  }
}

/**
 * Spawn a single extras icon with glitchy appearance
 */
function spawnExtrasIcon(data, canvasHeight) {
  const el = document.createElement('div')

  // Schedule a single black screen 10s after the first extras icon spawns
  if (!blackScreenScheduled) {
    blackScreenScheduled = true;
    blackScreenTimeoutId = setTimeout(() => {
      startBlackPixelatedTransition().then(() => {
        // 3 seconds after the screen is black, start the justice sequence
        setTimeout(() => {
          startJusticeSpine();
        }, 3000);
      });
    }, 10000);
  }
  
  // Extract icon name from attachment (e.g., "browser.png_4" -> "browser.png")
  // Files are named with double extension: browser.png.png
  const iconName = data.attachment.split('_')[0]
  const imgPath = `extras spine/${iconName}.png`
  
  // Y-flip like other modules
  const targetY = canvasHeight - data.y
  
  // Create image element like desktop icons
  const img = document.createElement('img')
  img.src = imgPath
  img.style.cssText = `
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
  `
  
  el.style.cssText = `
    position: absolute;
    left: ${data.x}px;
    top: ${targetY}px;
    pointer-events: none;
  `
  
  el.appendChild(img)
  extrasContainer.appendChild(el)
  
  // Desktop-style glitch animation - fast and snappy
  const glitchDuration = 150
  const glitchInterval = 20
  const glitchCount = glitchDuration / glitchInterval
  let glitchCounter = 0
  
  const glitchTimer = setInterval(() => {
    if (glitchCounter >= glitchCount) {
      clearInterval(glitchTimer)
      // Final state - clean
      img.style.transform = ''
      img.style.opacity = '1'
      img.style.filter = ''
      return
    }
    
    // Same glitch effects as desktop icons
    const glitchEffects = [
      `translateX(${(Math.random() - 0.5) * 10}px) skewX(${(Math.random() - 0.5) * 30}deg)`,
      `translateY(${(Math.random() - 0.5) * 10}px) scaleX(${0.7 + Math.random() * 0.6})`,
      `translateX(${(Math.random() - 0.5) * 15}px) scaleY(${0.7 + Math.random() * 0.6})`,
      'translateX(0) translateY(0)'
    ]
    
    img.style.transform = glitchEffects[Math.floor(Math.random() * glitchEffects.length)]
    img.style.opacity = Math.random() > 0.3 ? '1' : '0.5'
    img.style.filter = Math.random() > 0.5 ? 'invert(1) hue-rotate(180deg)' : 'none'
    
    glitchCounter++
  }, glitchInterval)
}

// --- New Minefield Sequence ---
let minefieldContainer = null;
let drawingContainer = null;
let daggersContainer = null;

/**
 * Generic utility to parse a Spine JSON file.
 * @param {string} path - Path to the Spine JSON file.
 * @param {string} origin - A string to identify the origin of the spine data.
 * @returns {Promise<Array>} - A promise that resolves to an array of spine data objects.
 */
async function parseSpineFile(path, origin) {
  try {
    const response = await fetch(path);
    const spineJson = await response.json();
    
    const skin = spineJson.skins.default;
    if (!skin) return [];

    const folder = path.substring(0, path.lastIndexOf('/'));

    const spineData = spineJson.slots.map(slot => {
      const attachmentName = slot.attachment;
      if (!skin[attachmentName] || !skin[attachmentName][attachmentName]) {
        return null;
      }
      const skinAttachment = skin[attachmentName][attachmentName];
      
      return {
        origin: origin,
        attachment: attachmentName,
        path: `${folder}/${attachmentName}.png`,
        ...skinAttachment
      };
    }).filter(Boolean);

    return spineData;
  } catch (e) {
    console.error(`Failed to parse spine file at ${path}:`, e);
    return [];
  }
}

/**
 * Starts the sequence to place reactive mines on the screen.
 */
async function startMinefieldSequence() {
    console.log('💣 Starting Minefield Sequence...');
    
    const mineSpine2Data = await parseSpineFile('mine spine 2/Spine.json', 'mine-spine-2');
    const otherMineData = await parseSpineFile('other mine/Spine.json', 'other-mine');

    let allMinesData = [...mineSpine2Data, ...otherMineData];
    
    shuffle(allMinesData);

    const maxDelay = 30; // 10 + 20
    const totalDuration = allMinesData.length * maxDelay;

    allMinesData.forEach((mineData, index) => {
        const delay = index * (10 + Math.random() * 20);
        setTimeout(() => {
            spawnReactiveMine(mineData);
        }, delay); 
    });

    setTimeout(() => {
        startDrawingAndDaggerSequence();
    }, totalDuration);
}

/**
 * Spawns a single reactive mine on the screen.
 * @param {object} data - The spine data for the mine.
 */
function spawnReactiveMine(data) {
    if (!minefieldContainer) {
        minefieldContainer = document.createElement('div');
        minefieldContainer.id = 'minefield-container';
        minefieldContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2100;
        `;
        document.body.appendChild(minefieldContainer);
    }

    const tile = document.createElement('div');
    tile.dataset.origin = data.origin; // Set the origin
    const canvasHeight = window.innerHeight;

    // Center-based position
    const left = data.x;
    const top = canvasHeight - data.y;

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
    `;

    tile.onmouseenter = () => tile.style.transform = 'translate(-50%, -50%) scale(1.1)';
    tile.onmouseleave = () => tile.style.transform = 'translate(-50%, -50%) scale(1)';

    tile.onclick = () => {
        // On click, show a random number like in the original minesweeper
        tile.style.backgroundImage = 'none';
        tile.style.backgroundColor = '#d0d0d0';
        tile.style.border = '1px solid #808080';
        
        const num = Math.floor(Math.random() * 4); // 0-3
        if (num > 0) {
            const colors = ['', '#0000ff', '#008000', '#ff0000'];
            tile.style.color = colors[num] || 'black';
            tile.style.fontWeight = 'bold';
            tile.style.fontSize = Math.min(data.width, data.height) * 0.8 + 'px';
            tile.style.fontFamily = "'VT323', monospace";
            tile.textContent = num;
        }

        // Make it non-interactive after click
        tile.onclick = null;
        tile.onmouseenter = null;
        tile.onmouseleave = null;
        tile.style.cursor = 'default';
    };

    minefieldContainer.appendChild(tile);
}

/**
 * Spawns the image from the drawing spine.
 * @param {object} data - The spine data for the drawing.
 */
function spawnDrawingImage(data) {
    if (!drawingContainer) {
        drawingContainer = document.createElement('div');
        drawingContainer.id = 'drawing-container';
        drawingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2050; 
        `;
        document.body.appendChild(drawingContainer);
    }

    const img = document.createElement('img');
    img.src = data.path;
    const canvasHeight = window.innerHeight;

    const left = data.x - data.width / 2;
    const top = canvasHeight - data.y - data.height / 2;

    img.style.cssText = `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: ${data.width}px;
        height: ${data.height}px;
        object-fit: contain;
    `;
    
    drawingContainer.appendChild(img);
}

/**
 * Spawns a dagger image.
 * @param {object} data - The spine data for the dagger.
 */
function spawnDaggerImage(data) {
    if (!daggersContainer) {
        daggersContainer = document.createElement('div');
        daggersContainer.id = 'daggers-container';
        daggersContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2200; 
        `;
        document.body.appendChild(daggersContainer);
    }

    const img = document.createElement('img');
    img.src = data.path;
    const canvasHeight = window.innerHeight;

    const left = data.x - data.width / 2;
    const top = canvasHeight - data.y - data.height / 2;

    img.style.cssText = `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: ${data.width}px;
        height: ${data.height}px;
        object-fit: contain;
    `;
    
    daggersContainer.appendChild(img);
}


/**
 * Starts the sequence of drawing, removing mines, and adding daggers.
 */
async function startDrawingAndDaggerSequence() {
    console.log('🔪 Starting Drawing and Dagger Sequence...');

    // 1. Spawn the drawing image
    const drawingData = await parseSpineFile('drawing spine/Spine.json');
    if (drawingData.length > 0) {
        spawnDrawingImage(drawingData[0]);
    }

    // 2. Get mines to remove and daggers to add
    const otherMines = Array.from(document.querySelectorAll('[data-origin="other-mine"]'));
    const daggersData = await parseSpineFile('daggers spine/Spine.json');

    shuffle(otherMines);
    shuffle(daggersData);

    // 3. Start the simultaneous removal and addition
    const interval = 50; // ms between each swap (faster)
    let currentIndex = 0;

    const loop = setInterval(() => {
        if (currentIndex >= otherMines.length && currentIndex >= daggersData.length) {
            clearInterval(loop);
            setTimeout(startRedSequence, 3000);
            return;
        }

        // Remove a mine
        if (currentIndex < otherMines.length) {
            const mineToRemove = otherMines[currentIndex];
            mineToRemove.remove();
        }

        // Add a dagger
        if (currentIndex < daggersData.length) {
            const daggerToAdd = daggersData[currentIndex];
            spawnDaggerImage(daggerToAdd);
        }
        
        currentIndex++;
    }, interval);
}


/**
 * Stop the chaos sequence and clean up
 */
export function stopChaosSequence() {
  isSequenceActive = false
  
  // Stop unwanted mouse movements
  if (mouseJitterInterval) {
    clearInterval(mouseJitterInterval)
    mouseJitterInterval = null
  }
  
  // Clean up extras container
  if (extrasContainer) {
    extrasContainer.remove()
    extrasContainer = null
  }

  // Clean up justice container
  if (justiceContainer) {
    justiceContainer.remove();
    justiceContainer = null;
  }

  // Clean up minefield container
  if (minefieldContainer) {
    minefieldContainer.remove();
    minefieldContainer = null;
  }

  // Clean up drawing container
  if (drawingContainer) {
    drawingContainer.remove();
    drawingContainer = null;
  }

  // Clean up daggers container
  if (daggersContainer) {
    daggersContainer.remove();
    daggersContainer = null;
  }
  
  const blackCanvas = document.getElementById('black-glitch-canvas');
  if (blackCanvas) blackCanvas.remove();
  
  // We might want to keep the black overlay if it's a permanent state, 
  // but for "stopChaosSequence" which implies cleanup/reset, we should probably remove it.
  const blackOverlay = document.getElementById('black-screen-overlay');
  if (blackOverlay) blackOverlay.remove();

  // Clear any scheduled black screen
  if (blackScreenTimeoutId) {
    clearTimeout(blackScreenTimeoutId)
    blackScreenTimeoutId = null
    blackScreenScheduled = false
  }

  if (windowsContainer) { windowsContainer.remove(); windowsContainer = null; }
  if (weaponsContainer) { weaponsContainer.remove(); weaponsContainer = null; }
  if (lastWordsContainer) { lastWordsContainer.remove(); lastWordsContainer = null; }
  if (blendingImageContainer) { blendingImageContainer.remove(); blendingImageContainer = null; }
  if (glitchyIconsContainer) { glitchyIconsContainer.remove(); glitchyIconsContainer = null; }
  if (questionContainer) { questionContainer.remove(); questionContainer = null; }
  if (checkerboardContainer) { checkerboardContainer.remove(); checkerboardContainer = null; }
  if (redOverlay) { redOverlay.remove(); redOverlay = null; }
}

// New container for the justice spine
let justiceContainer = null;

/**
 * Utility to shuffle an array
 * @param {Array} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Load and display justice spine images in a glitchy, random order.
 */
async function startJusticeSpine() {
  console.log('⚖️ Starting Justice Spine Sequence...');

  try {
    // Load Spine Data
    const response = await fetch('justice spine/Spine.json');
    const text = await response.text();

    // This is a simplified and potentially brittle parser.
    // It assumes a specific structure and may fail on different Spine JSONs.
    const spineJson = JSON.parse(text);

    const spineData = spineJson.slots.map(slot => {
      const attachmentName = slot.attachment;
      const skinAttachment = spineJson.skins.default[attachmentName][attachmentName];
      return {
        attachment: attachmentName,
        ...skinAttachment
      };
    });

    // Sort all slices from top to bottom based on their y-coordinate
    spineData.sort((a, b) => b.y - a.y);

    // Create container
    justiceContainer = document.createElement('div');
    justiceContainer.id = 'justice-spine-container';
    justiceContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2000;
      overflow: hidden;
    `;
    document.body.appendChild(justiceContainer);

    // Spawn each image in the specified order with a glitchy delay
    const canvasHeight = window.innerHeight;
    spineData.forEach((data, index) => {
      // Stagger the appearance
      const delay = index * 80; // Faster, more consistent appearance
      setTimeout(() => {
        spawnJusticeIcon(data, canvasHeight);
      }, delay);
    });

    // Schedule the minefield sequence
    setTimeout(() => {
        startMinefieldSequence();
    }, 2000);

  } catch (e) {
    console.error('Failed to load justice spine:', e);
  }
}

/**
 * Spawn a single justice icon with a very glitchy appearance
 */
function spawnJusticeIcon(data, canvasHeight) {
  const el = document.createElement('div');
  const img = document.createElement('img');

  const imgPath = `justice spine/${data.attachment}.png`;
  img.src = imgPath;
  img.style.cssText = `
    width: ${data.width}px;
    height: ${data.height}px;
    object-fit: contain;
  `;

  // Position is centered
  const targetX = data.x - data.width / 2;
  const targetY = canvasHeight - data.y - data.height / 2;

  el.style.cssText = `
    position: absolute;
    left: ${targetX}px;
    top: ${targetY}px;
    pointer-events: none;
    transform-origin: center;
  `;

  el.appendChild(img);
  justiceContainer.appendChild(el);

  // Desktop-style glitch animation - smaller and more controlled
  const glitchDuration = 150 + Math.random() * 100; // shorter duration
  const glitchInterval = 20;
  const glitchCount = glitchDuration / glitchInterval;
  let glitchCounter = 0;
  
  const glitchTimer = setInterval(() => {
    if (glitchCounter >= glitchCount) {
      clearInterval(glitchTimer);
      // Final state - continuous jitter
      img.style.opacity = '1';
      img.style.filter = '';
      startContinuousJitter(img);
      return;
    }
    
    // Effects inspired by desktop icons - smaller movements
    const glitchEffects = [
      `translateX(${(Math.random() - 0.5) * 8}px) skewX(${(Math.random() - 0.5) * 20}deg)`,
      `translateY(${(Math.random() - 0.5) * 8}px) scaleX(${0.8 + Math.random() * 0.4})`,
      `translateX(${(Math.random() - 0.5) * 12}px) scaleY(${0.8 + Math.random() * 0.4})`,
      'translateX(0) translateY(0)'
    ];
    
    img.style.transform = glitchEffects[Math.floor(Math.random() * glitchEffects.length)];
    img.style.opacity = Math.random() > 0.3 ? '1' : '0.5';
    // Adding a more "pixely" feel with filter
    img.style.filter = Math.random() > 0.6 ? 'contrast(2) brightness(1.5)' : 'none';
    
    glitchCounter++;
  }, glitchInterval);
}

/**
 * Apply continuous small jitter to an element
 */
function startContinuousJitter(element) {
  const jitterInterval = setInterval(() => {
    if (!element.isConnected) {
      clearInterval(jitterInterval);
      return;
    }
    
    // Small pixel jitter
    const tx = Math.floor((Math.random() - 0.5) * 3); 
    const ty = Math.floor((Math.random() - 0.5) * 3);
    
    element.style.transform = `translate(${tx}px, ${ty}px)`;
    
  }, 60);
}

/**
 * Transition to black background with pixelated glitch effect
 */
function startBlackPixelatedTransition() {
  return new Promise((resolve) => {
    // Create overlay canvas
    const canvas = document.createElement('canvas')
    canvas.id = 'black-glitch-canvas'
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1999;
    `
    document.body.appendChild(canvas)
    
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const pixelSize = 16 
    const cols = Math.ceil(canvas.width / pixelSize)
    const rows = Math.ceil(canvas.height / pixelSize)
    
    // Create array of all pixel positions
    const pixels = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pixels.push({ x, y })
      }
    }
    
    // Shuffle pixels
    for (let i = pixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pixels[i], pixels[j]] = [pixels[j], pixels[i]]
    }
    
    let currentIndex = 0
    const totalPixels = pixels.length
    const duration = 1200 // 1.2 seconds
    const pixelsPerFrame = Math.ceil(totalPixels / (duration / 16))
    
    function fillPixels() {
      const batchSize = Math.max(1, Math.floor(pixelsPerFrame * (0.5 + Math.random() * 1.5)))
      
      ctx.fillStyle = '#000000'
      
      for (let i = 0; i < batchSize && currentIndex < pixels.length; i++) {
        const pixel = pixels[currentIndex]
        // Random size variation for glitchy effect
        const sizeVariation = Math.random() > 0.8 ? pixelSize * (0.5 + Math.random()) : pixelSize
        ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, sizeVariation, sizeVariation)
        currentIndex++
      }
      
      if (currentIndex < pixels.length) {
        requestAnimationFrame(fillPixels)
      } else {
        // Transition complete
        // Create a solid black backing to ensure full coverage
        const blackOverlay = document.createElement('div')
        blackOverlay.id = 'black-screen-overlay'
        blackOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: black;
            z-index: 1998;
        `
        document.body.appendChild(blackOverlay)
        
        // Start persistent glitch effect on the canvas
        startBlackVoidGlitch(canvas, ctx, cols, rows, pixelSize)
        resolve()
      }
    }
    
    requestAnimationFrame(fillPixels)
  })
}

function startBlackVoidGlitch(canvas, ctx, cols, rows, pixelSize) {
  // Very subtle dark grey glitches to simulate digital void
  const glitchColors = ['#080808', '#111111', '#000000', '#050505']
  
  function drawGlitch() {
    if (!canvas.isConnected) return
    
    const glitchCount = 5 + Math.floor(Math.random() * 10)
    
    for (let i = 0; i < glitchCount; i++) {
      const x = Math.floor(Math.random() * cols) * pixelSize
      const y = Math.floor(Math.random() * rows) * pixelSize
      const w = (1 + Math.floor(Math.random() * 4)) * pixelSize
      const h = (1 + Math.floor(Math.random() * 2)) * pixelSize
      
      ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)]
      ctx.fillRect(x, y, w, h)
    }
    
    // Occasional "dead pixel" cluster
    if (Math.random() > 0.95) {
       const x = Math.floor(Math.random() * cols) * pixelSize
       const y = Math.floor(Math.random() * rows) * pixelSize
       ctx.fillStyle = '#1a1a1a' // Slightly lighter grey
       ctx.fillRect(x, y, pixelSize, pixelSize)
    }

    setTimeout(drawGlitch, 50 + Math.random() * 150)
  }
  
  drawGlitch()
}
