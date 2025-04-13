import { handleMessage } from './messageDispatcher'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(response => sendResponse(response))
    .catch(error => {
      console.error('Error handling message:', error)
      sendResponse({ success: false, error: error.message })
    })

  // Necesario para mantener el canal abierto en async
  return true
})

console.log('FullRes background service worker loaded')
