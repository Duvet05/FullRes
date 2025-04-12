chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RESOLUTION_DETECTED") {
    const resolution = message.payload;
    console.log(`Resolution detected: ${resolution.width}x${resolution.height}`);
  } else if (message.type === "SAVE_SETTINGS") {
    chrome.storage.local.set({ settings: message.payload }, () => {
      console.log("Settings updated");
    });
  }
});
