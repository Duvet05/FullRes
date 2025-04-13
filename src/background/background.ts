import { saveSettings } from '../utils/storage'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'RESOLUTION_DETECTED':
        handleResolutionDetected(message.payload)
        break

      case 'GET_RESOLUTION':
        sendResponse({ error: 'Not available in service worker' })
        break

      case 'SAVE_SETTINGS':
        handleSaveSettings(message.payload)
          .then(() => sendResponse({ success: true }))
          .catch(err => sendResponse({ success: false, error: err.message }))
        return true // keep message channel open for async response

      default:
        console.warn('Unknown message type:', message.type)
    }
  } catch (error) {
    console.error('Error handling message:', error)
  }
})

function handleResolutionDetected(payload: { width: number; height: number }) {
  console.log(`Resolution detected: ${payload.width}x${payload.height}`)
}

async function handleSaveSettings(payload: any) {
  await saveSettings(payload)
  console.log('Settings updated')
}

console.log('FullRes background service worker loaded')
