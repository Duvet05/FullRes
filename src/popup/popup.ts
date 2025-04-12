document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const toggleButton = document.getElementById("toggle")!;
  
    // Obtener resolución del background
    chrome.runtime.sendMessage({ type: "GET_RESOLUTION" }, (response) => {
      if (response?.width && response?.height) {
        resolutionSpan.textContent = `${response.width}x${response.height}`;
      } else {
        resolutionSpan.textContent = "Unknown";
      }
    });
  
    // Toggle de la extensión (placeholder)
    toggleButton.addEventListener("click", () => {
      console.log("Extension toggled");
    });
  });