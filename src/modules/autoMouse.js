/**
 * Auto Mouse Module
 * Handles automated mouse movement, clicking, and typing
 * Creates a fake cursor that moves independently while user can still move their real mouse
 */

let fakeCursor = null
let isAutomating = false
let currentX = 0
let currentY = 0

/**
 * Initialize the fake cursor element
 */
function initFakeCursor() {
  if (fakeCursor) return fakeCursor

  fakeCursor = document.createElement('img')
  fakeCursor.src = 'mouse spine/MOUSE.png.png'
  fakeCursor.id = 'fake-cursor'
  fakeCursor.style.cssText = `
    position: fixed;
    width: 16px;
    height: 16px;
    pointer-events: none;
    z-index: 99999;
    opacity: 0;
    transform-origin: top left;
    transition: opacity 0.3s ease;
  `
  document.body.appendChild(fakeCursor)
  return fakeCursor
}

/**
 * Show the fake cursor
 */
function showCursor() {
  if (!fakeCursor) initFakeCursor()
  fakeCursor.style.opacity = '1'
}

/**
 * Hide the fake cursor
 */
function hideCursor() {
  if (fakeCursor) {
    fakeCursor.style.opacity = '0'
  }
}

/**
 * Remove the fake cursor completely
 */
export function removeFakeCursor() {
  if (fakeCursor) {
    fakeCursor.remove()
    fakeCursor = null
  }
  isAutomating = false
}

/**
 * Set cursor position instantly
 */
function setCursorPosition(x, y) {
  currentX = x
  currentY = y
  if (fakeCursor) {
    fakeCursor.style.left = x + 'px'
    fakeCursor.style.top = y + 'px'
  }
}

/**
 * Animate cursor to a position with easing
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 */
function animateCursorTo(targetX, targetY, duration = 800) {
  return new Promise((resolve) => {
    const startX = currentX
    const startY = currentY
    const startTime = performance.now()

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4)
    }

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)

      const x = startX + (targetX - startX) * eased
      const y = startY + (targetY - startY) * eased

      setCursorPosition(x, y)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }

    requestAnimationFrame(animate)
  })
}

/**
 * Get the center position of an element
 * @param {HTMLElement} element - The target element
 * @returns {object} {x, y} center coordinates
 */
function getElementCenter(element) {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

/**
 * Move cursor to an element and optionally click it
 * @param {HTMLElement|string} target - Element or selector
 * @param {boolean} click - Whether to click after moving
 * @param {number} duration - Movement duration
 * @returns {Promise}
 */
async function moveTo(target, click = false, duration = 800) {
  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element) return

  const { x, y } = getElementCenter(element)
  await animateCursorTo(x, y, duration)

  if (click) {
    await clickElement(element)
  }
}

/**
 * Simulate a click on an element
 * @param {HTMLElement} element - Element to click
 * @returns {Promise}
 */
function clickElement(element) {
  return new Promise((resolve) => {
    // Visual feedback - small cursor pulse
    if (fakeCursor) {
      fakeCursor.style.transform = 'scale(0.9)'
      setTimeout(() => {
        fakeCursor.style.transform = 'scale(1)'
      }, 100)
    }

    // Dispatch click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(clickEvent)

    setTimeout(resolve, 150)
  })
}

/**
 * Simulate a double-click on an element
 * @param {HTMLElement} element - Element to double-click
 * @returns {Promise}
 */
function dblClickElement(element) {
  return new Promise((resolve) => {
    // Visual feedback
    if (fakeCursor) {
      fakeCursor.style.transform = 'scale(0.9)'
      setTimeout(() => {
        fakeCursor.style.transform = 'scale(1)'
        setTimeout(() => {
          fakeCursor.style.transform = 'scale(0.9)'
          setTimeout(() => {
            fakeCursor.style.transform = 'scale(1)'
          }, 100)
        }, 100)
      }, 100)
    }

    // Dispatch dblclick event
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(dblClickEvent)

    setTimeout(resolve, 300)
  })
}

/**
 * Type text into an input field character by character
 * @param {HTMLElement} input - Input element to type into
 * @param {string} text - Text to type
 * @param {number} delay - Delay between characters in ms
 * @returns {Promise}
 */
function typeText(input, text, delay = 80) {
  return new Promise((resolve) => {
    input.focus()
    let index = 0

    function typeChar() {
      if (index < text.length) {
        input.value += text[index]
        // Dispatch input event for any listeners
        input.dispatchEvent(new Event('input', { bubbles: true }))
        index++
        setTimeout(typeChar, delay + Math.random() * 40) // Slight randomness for realism
      } else {
        resolve()
      }
    }

    typeChar()
  })
}

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Run the login automation sequence
 * @returns {Promise}
 */
export async function runLoginAutomation() {
  if (isAutomating) return
  isAutomating = true

  initFakeCursor()

  // Get the main canvas for positioning reference
  const canvas = document.getElementById('main-canvas')
  const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 }

  // Start cursor off-screen (bottom right area)
  setCursorPosition(canvasRect.left + 1200, canvasRect.top + 600)

  // Wait a moment then show cursor
  await wait(500)
  showCursor()
  await wait(300)

  // Get input elements
  const usernameInput = document.getElementById('username')
  const passwordInput = document.getElementById('password')
  const loginButton = document.getElementById('login-button')

  if (!usernameInput || !passwordInput || !loginButton) {
    console.error('Login elements not found')
    isAutomating = false
    return
  }

  // Move to username field
  await moveTo(usernameInput, true, 600)
  await wait(200)

  // Type username
  await typeText(usernameInput, 'your name', 70)
  await wait(400)

  // Move to password field
  await moveTo(passwordInput, true, 500)
  await wait(200)

  // Type password
  await typeText(passwordInput, 'password', 70)
  await wait(500)

  // Move to login button and click
  await moveTo(loginButton, true, 400)

  // Keep cursor visible during transition
  await wait(1000)

  isAutomating = false
}

/**
 * Run the README click automation (after login)
 * @returns {Promise}
 */
export async function runReadmeAutomation() {
  if (isAutomating) return
  isAutomating = true

  if (!fakeCursor) initFakeCursor()
  showCursor()

  // Wait for README files to spawn
  await wait(1500)

  // Find a README file
  const readmeFile = document.querySelector('.desktop-file')

  if (!readmeFile) {
    console.error('No README file found')
    isAutomating = false
    return
  }

  // Move to the README file
  await moveTo(readmeFile, false, 800)
  await wait(300)

  // Double-click to open
  await dblClickElement(readmeFile)

  // Wait for README window to open, then click top right (close button)
  await wait(600)
  const readmeWindow = [...document.querySelectorAll('.window')].find(
    (el) => el.querySelector('.window-title span:last-child')?.textContent?.includes('README')
  )
  if (readmeWindow) {
    const closeBtn = readmeWindow.querySelector('.window-controls .close-btn')
    if (closeBtn) {
      await moveTo(closeBtn, true, 500)
      await wait(300)
    }
  }

  // Wait 10 seconds as requested
  await wait(4000)

  // Find and click the overlay to close it
  const overlay = document.querySelector('div[style*="z-index: 2000"]')
  if (overlay) {
    const overlayImg = overlay.querySelector('img')
    if (overlayImg) {
      await moveTo(overlayImg, true, 500)
    } else {
      await clickElement(overlay)
    }
  }

  // Hide cursor after automation
  await wait(500)
  hideCursor()

  isAutomating = false
}

/**
 * Check if automation is currently running
 * @returns {boolean}
 */
export function isAutoMouseActive() {
  return isAutomating
}

/**
 * Run the full automation sequence
 * This is the main entry point for the automated experience
 */
export async function runFullAutomation() {
  // Run login automation
  await runLoginAutomation()

  // Wait for desktop to load, then run README automation
  // The README automation will be triggered after login completes
}

export { showCursor, hideCursor, moveTo, wait }
