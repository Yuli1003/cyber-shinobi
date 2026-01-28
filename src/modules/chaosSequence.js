/**
 * Chaos Sequence Module
 * Orchestrates the three phases of the glitchy sequence
 *
 * NEW ORDER:
 * Phase 1: Icon click to Black screen
 * Phase 2: Black screen content (phase2-blackToRed.js) -> Red transition
 * Phase 3: Red screen content (phase3-redToEnd.js) -> End
 *
 * DEBUG: Use window.debugPhase1(), debugPhase2(), debugPhase3() in console
 */

import { startPhase1, setOnBlackScreenComplete as setOnPhase1BlackComplete, cleanupPhase1 } from './phase1-iconToBlack.js'
import { startPhase2, setOnRedScreenComplete as setOnPhase2RedComplete, cleanupPhase2 } from './phase2-blackToRed.js'
import { startPhase3, cleanupPhase3 } from './phase3-redToEnd.js'

let isSequenceActive = false

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

  // Set up phase transitions (NEW ORDER: Phase 1 → Phase 2 → Phase 3)
  setOnPhase1BlackComplete(() => {
    console.log('🖤 Black screen complete, starting Phase 2...')
    cleanupPhase1()
    startPhase2()
  })

  setOnPhase2RedComplete(() => {
    console.log('🔴 Red screen complete, starting Phase 3...')
    startPhase3()
    cleanupPhase2()

  })

  // Start Phase 1
  startPhase1()
}

/**
 * Stop the chaos sequence and clean up all phases
 */
export function stopChaosSequence() {
  isSequenceActive = false

  cleanupPhase1()
  cleanupPhase2()
  cleanupPhase3()

  console.log('🛑 Chaos Sequence stopped and cleaned up')
}

// ============================================
// DEBUG FUNCTIONS - Run phases separately
// NEW ORDER: Phase 1 → Phase 3 → Phase 2
// ============================================

/**
 * Debug: Run Phase 1 only (Icon to Red screen)
 * Call from console: debugPhase1()
 */
export function debugPhase1() {
  console.log('🔧 DEBUG: Starting Phase 1 only...')
  stopChaosSequence() // Clean up any existing state

  // Disable auto-transition to phase 2
  setOnPhase1BlackComplete(() => {
    console.log('🔧 DEBUG: Phase 1 complete (black screen reached). Phase 2 not started.')
  })

  startPhase1()
}

/**
 * Debug: Run Phase 3 only (Red screen content → Black transition)
 * Call from console: debugPhase3()
 */
export function debugPhase3() {
  console.log('🔧 DEBUG: Starting Phase 3 only...')
  stopChaosSequence() // Clean up any existing state

  // Create red screen background for phase 3
  const redOverlay = document.createElement('div')
  redOverlay.id = 'red-screen-overlay'
  redOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #400000;
    z-index: 2500;
    pointer-events: none;
  `
  document.body.appendChild(redOverlay)

  // Phase 3 is end
  // setOnPhase3BlackComplete(() => {
  //   console.log('🔧 DEBUG: Phase 3 complete (black screen reached).')
  // })

  startPhase3()
}

/**
 * Debug: Run Phase 2 only (Black screen - final phase)
 * Call from console: debugPhase2()
 */
export function debugPhase2() {
  console.log('🔧 DEBUG: Starting Phase 2 only...')
  stopChaosSequence() // Clean up any existing state

  // Create black screen background for phase 2
  const blackOverlay = document.createElement('div')
  blackOverlay.id = 'black-screen-overlay'
  blackOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    z-index: 3500;
  `
  document.body.appendChild(blackOverlay)

  setOnPhase2RedComplete(() => {
    console.log('🔧 DEBUG: Phase 2 complete (red screen reached). Phase 3 not started.')
  })

  startPhase2()
}

/**
 * Debug: Clean up everything
 * Call from console: debugCleanup()
 */
export function debugCleanup() {
  console.log('🔧 DEBUG: Cleaning up all phases...')
  stopChaosSequence()
}

// Expose debug functions globally for console access
if (typeof window !== 'undefined') {
  window.debugPhase1 = debugPhase1
  window.debugPhase2 = debugPhase2
  window.debugPhase3 = debugPhase3
  window.debugCleanup = debugCleanup

  console.log('🔧 Debug functions available: debugPhase1(), debugPhase2(), debugPhase3(), debugCleanup()')
}
