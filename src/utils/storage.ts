interface UserSettings {
    resolutionPriority: "max" | "auto";
    ultraWideMode: "zoom" | "crop" | "stretch" | "none";
    enabledPlatforms: string[];
  }
  
  const defaultSettings: UserSettings = {
    resolutionPriority: "auto",
    ultraWideMode: "none",
    enabledPlatforms: ["netflix", "hbomax", "disneyplus", "primevideo", "youtube"],
  };
  
  export async function getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get("settings", (data) => {
        resolve({ ...defaultSettings, ...data.settings });
      });
    });
  }
  
  // LO QUE SEA
  export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
    const currentSettings = await getSettings();
    return new Promise((resolve) => {
      console.log("Saving settings", { ...currentSettings, ...settings });
      chrome.storage.local.set(
        { settings: { ...currentSettings, ...settings } },
        () => resolve()
      );
    });
  }