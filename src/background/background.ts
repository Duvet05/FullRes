import { getSettings, saveSettings } from '../utils/storage';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "RESOLUTION_DETECTED") {
        const resolution = message.payload;
        console.log(`Resolution detected: ${resolution.width}x${resolution.height}`);
    } else if (message.type === "GET_RESOLUTION") {
        sendResponse({ width: window.screen.width, height: window.screen.height });
    } else if (message.type === "SAVE_SETTINGS") {
        saveSettings(message.payload).then(() => {
            console.log("Settings updated");
        });
    }
});

console.log("FullRes background script loaded");