import { getSettings, saveSettings, UserSettings } from '../utils/storage';

document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const statusSpan = document.getElementById("status")!;
    const toggleInput = document.getElementById("toggle")! as HTMLInputElement;

    // Actualizar resolución
    const updateResolution = () => {
        chrome.runtime.sendMessage({ type: "GET_RESOLUTION" }, (response) => {
            if (response?.width && response?.height) {
                resolutionSpan.textContent = `${response.width}x${response.height}`;
            } else {
                resolutionSpan.textContent = "Desconocida";
            }
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
    getSettings().then((settings) => {
        updateUI(settings);
        updateResolution();
    });

    // Manejar toggle
    toggleInput.addEventListener("change", () => {
        const newPriority = toggleInput.checked ? "max" : "auto";
        saveSettings({ resolutionPriority: newPriority }).then(() => {
            console.log(`Extensión ${newPriority === "max" ? "activada" : "desactivada"}`);
            getSettings().then(updateUI);
            updateResolution();
        });
    });
});