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
  
  export function sendResolutionToBackground() {
    const resolution = detectScreenResolution();
    chrome.runtime.sendMessage({
      type: "RESOLUTION_DETECTED",
      payload: resolution,
    });
  }
  
  // Ejecutar al cargar la página
  sendResolutionToBackground();
  
  // Escuchar cambios en la resolución (e.g., cambio de monitor)
  window.addEventListener("resize", sendResolutionToBackground);