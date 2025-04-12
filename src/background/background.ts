import { Resolution } from "../content/detectResolution";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RESOLUTION_DETECTED") {
    const resolution: Resolution = message.payload;
    console.log(`Resolution detected: ${resolution.width}x${resolution.height}`);
    // Aquí puedes almacenar la resolución o enviarla a otros scripts
  }
});

// Inicializar la extensión
console.log("FullRes background script loaded");