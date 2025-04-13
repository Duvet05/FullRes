document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const statusSpan = document.getElementById("status")!;
    const refreshButton = document.getElementById("refresh")! as HTMLButtonElement;

    // Actualizar resolución
    const updateResolution = () => {
        statusSpan.textContent = "Cargando...";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !tab.url || !tab.url.match(/^https?:\/\//)) {
                console.log("Pestaña no soportada para content script:", tab?.url || "unknown");
                // Fallback al background
                chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (response) => {
                    if (response?.width && response?.height) {
                        resolutionSpan.textContent = `${response.width}x${response.height} (reciente)`;
                        statusSpan.textContent = "OK";
                    } else {
                        resolutionSpan.textContent = "No disponible";
                        statusSpan.textContent = "No soportada";
                    }
                });
                return;
            }

            // Enviar al content script
            chrome.tabs.sendMessage(tab.id, { type: "GET_RESOLUTION" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Content script no disponible:", chrome.runtime.lastError.message);
                    chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (bgResponse) => {
                        if (bgResponse?.width && bgResponse?.height) {
                            resolutionSpan.textContent = `${bgResponse.width}x${bgResponse.height} (reciente)`;
                            statusSpan.textContent = "OK";
                        } else {
                            resolutionSpan.textContent = "No disponible";
                            statusSpan.textContent = "No soportada";
                        }
                    });
                    return;
                }
                if (response?.width && response?.height) {
                    resolutionSpan.textContent = `${response.width}x${response.height}`;
                    statusSpan.textContent = "OK";
                } else {
                    console.log("Respuesta inválida:", response);
                    resolutionSpan.textContent = "No disponible";
                    statusSpan.textContent = "Error";
                }
            });
        });
    };

    // Cargar resolución al abrir
    updateResolution();

    // Botón de actualizar
    refreshButton.addEventListener("click", () => {
        refreshButton.disabled = true;
        updateResolution();
        setTimeout(() => {
            refreshButton.disabled = false;
        }, 1000); // Rehabilitar tras 1s
    });
});