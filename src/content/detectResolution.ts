function detectScreenResolution() {
  return {
    width: screen.width,
    height: screen.height,
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

window.addEventListener("resize", () => {
  sendResolutionToBackground();
});
window.addEventListener("orientationchange", () => {
  sendResolutionToBackground();
});
