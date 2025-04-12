document.addEventListener("DOMContentLoaded", () => {
  const resolutionSpan = document.getElementById("resolution")!;
  const toggleButton = document.getElementById("toggle")!;

  // Obtener resolución directamente (no vía background)
  const width = window.screen.width;
  const height = window.screen.height;
  resolutionSpan.textContent = `${width}x${height}`;

  toggleButton.addEventListener("click", () => {
    console.log("Extension toggled");
  });
});
