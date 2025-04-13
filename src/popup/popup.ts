import { saveSettings } from '../utils/storage';

document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const toggleButton = document.getElementById("toggle")!;

    chrome.runtime.sendMessage({ type: "GET_RESOLUTION" }, (response) => {
        if (response?.width && response?.height) {
            resolutionSpan.textContent = `${response.width}x${response.height}`;
        } else {
            resolutionSpan.textContent = "Unknown";
        }
    });

    toggleButton.addEventListener("click", () => {
        console.log("Extension toggled");
        saveSettings({ resolutionPriority: "max" }).then(() => {
            console.log("Settings saved");
        });
    });
});