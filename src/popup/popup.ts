import { saveSettings } from '../utils/storage';

document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const toggleButton = document.getElementById("toggle")!;

    // Función para obtener y actualizar la resolución
    const updateResolution = () => {
        chrome.runtime.sendMessage({ type: "GET_RESOLUTION" }, (response) => {
            if (response?.width && response?.height) {
                resolutionSpan.textContent = `${response.width}x${response.height}`;
            } else {
                resolutionSpan.textContent = "Unknown";
            }
        });
    };

    // Inicializar la resolución al cargar el popup
    updateResolution();

    // Acción del botón que actualiza la configuración
    toggleButton.addEventListener("click", () => {
        console.log("Verificando resolución...");
        saveSettings({ resolutionPriority: "max" }).then(() => {
            console.log("Configuración actualizada");
            updateResolution();  // Vuelve a obtener y mostrar la resolución después de guardar
        });
    });
});
