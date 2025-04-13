import { getSettings, saveSettings, UserSettings } from '../utils/storage';

document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const statusSpan = document.getElementById("status")!;
    const toggleInput = document.getElementById("toggle")! as HTMLInputElement;

    // Actualizar resolución
    const updateResolution = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !tab.url || !tab.url.match(/^https?:\/\//)) {
                console.log("Pestaña no soportada para content script:", tab?.url || "unknown");
                // Intentar desde background
                chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (response) => {
                    if (response?.width && response?.height) {
                        resolutionSpan.textContent = `${response.width}x${response.height} (reciente)`;
                    } else {
                        resolutionSpan.textContent = "No disponible";
                    }
                });
                return;
            }

            // Enviar al content script
            chrome.tabs.sendMessage(tab.id, { type: "GET_RESOLUTION" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Content script no disponible:", chrome.runtime.lastError.message);
                    // Fallback al background
                    chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (bgResponse) => {
                        if (bgResponse?.width && bgResponse?.height) {
                            resolutionSpan.textContent = `${bgResponse.width}x${bgResponse.height} (reciente)`;
                        } else {
                            resolutionSpan.textContent = "No disponible";
                        }
                    });
                    return;
                }
                if (response?.width && response?.height) {
                    resolutionSpan.textContent = `${response.width}x${response.height}`;
                } else {
                    console.log("Respuesta inválida:", response);
                    resolutionSpan.textContent = "No disponible";
                }
            });
        });
    };

    // Actualizar UI según configuración
    const updateUI = (settings: UserSettings) => {
        const isActive = settings.resolutionPriority === "max";
        toggleInput.checked = isActive;
        statusSpan.textContent = isActive ? "Activa" : "Inactiva";
        statusSpan.classList.toggle("active", isActive);
    };

    // Cargar configuración inicial
    getSettings()
        .then((settings) => {
            updateUI(settings);
            updateResolution();
        })
        .catch((error) => {
            console.error("Error al cargar configuración:", error);
            statusSpan.textContent = "Error";
        });

    // Manejar toggle
    toggleInput.addEventListener("change", () => {
        const newPriority = toggleInput.checked ? "max" : "auto";
        saveSettings({ resolutionPriority: newPriority })
            .then(() => {
                console.log(`Extensión ${newPriority === "max" ? "activada" : "desactivada"}`);
                getSettings().then(updateUI);
                updateResolution();
            })
            .catch((error) => {
                console.error("Error al guardar configuración:", error);
                statusSpan.textContent = "Error";
            });
    });
});