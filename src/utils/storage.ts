export interface UserSettings {
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

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const currentSettings = await getSettings();
  return new Promise((resolve) => {
      chrome.storage.local.set(
          { settings: { ...currentSettings, ...settings } },
          () => resolve()
      );
  });
}