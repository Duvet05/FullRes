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

sendResolutionToBackground();
window.addEventListener("resize", sendResolutionToBackground);