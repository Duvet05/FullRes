export interface Resolution {
  width: number;
  height: number;
}

export function detectScreenResolution(): Resolution {
  return {
      width: window.screen.width,
      height: window.screen.height,
  };
}

function sendResolutionToBackground() {
  const resolution = detectScreenResolution();
  chrome.runtime.sendMessage({
      type: "RESOLUTION_DETECTED",
      payload: resolution,
  });
}

// Escuchar mensajes (e.g., desde popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_RESOLUTION") {
      const resolution = detectScreenResolution();
      sendResponse(resolution);
  }
  return true; // Mantener canal abierto para respuestas asíncronas
});

// Enviar resolución inicial y en cambios
sendResolutionToBackground();
window.addEventListener("resize", sendResolutionToBackground);