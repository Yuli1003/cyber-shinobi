/**
 * Black Slime Module
 * Displays a slime GIF overlay
 * Triggered after README is closed
 */

let slimeContainer = null
let isActive = false

/**
 * Initialize and start the black slime effect
 * @param {Object} options - Configuration options
 * @param {boolean} options.singleIteration - If true, stops after one GIF cycle (approx 3 seconds)
 */
export function startBlackSlime(options = {}) {
  if (isActive) return
  isActive = true

  // Create main container
  slimeContainer = document.createElement('div')
  slimeContainer.id = 'black-slime-container'
  slimeContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 3150;
    overflow: hidden;
  `

  const img = document.createElement('img')
  // Add timestamp to force restart of GIF animation
  img.src = 'silme-2.gif?' + Date.now()
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `

  slimeContainer.appendChild(img)

  const canvas = document.getElementById('main-canvas')
  if (canvas) canvas.appendChild(slimeContainer)
  else document.body.appendChild(slimeContainer)

  // If single iteration, stop after the GIF plays once (adjust duration as needed)
  if (options.singleIteration) {
    setTimeout(() => {
      stopBlackSlime()
    }, 12000) // 12 seconds for one full GIF cycle
  }
}

/**
 * Stop and clean up the slime effect
 */
export function stopBlackSlime() {
  isActive = false
  
  if (slimeContainer) {
    slimeContainer.remove()
    slimeContainer = null
  }
}

/**
 * Check if slime effect is currently active
 */
export function isSlimeActive() {
  return isActive
}