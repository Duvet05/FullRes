document.addEventListener("DOMContentLoaded", () => {
    const resolutionSpan = document.getElementById("resolution")!;
    const statusSpan = document.getElementById("status")!;
    const refreshButton = document.getElementById("refresh")! as HTMLButtonElement;

    // Actualizar resolución y calidad
    const updateResolution = () => {
        statusSpan.textContent = "Cargando...";
        console.log("Solicitando resolución...");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !tab.url || !tab.url.match(/^https?:\/\//)) {
                console.log("Pestaña no soportada para content script:", tab?.url || "unknown");
                chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (response) => {
                    if (response?.width && response?.height) {
                        console.log(`Resolución reciente obtenida: ${response.width}x${response.height}`);
                        resolutionSpan.textContent = `${response.width}x${response.height} (reciente)`;
                        statusSpan.textContent = "OK";
                    } else {
                        console.log("No hay resolución reciente disponible");
                        resolutionSpan.textContent = "No disponible";
                        statusSpan.textContent = "No soportada";
                    }
                });
                return;
            }

            console.log(`Enviando GET_RESOLUTION a pestaña: ${tab.url}`);
            chrome.tabs.sendMessage(tab.id, { type: "GET_RESOLUTION" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Content script no disponible:", chrome.runtime.lastError.message);
                    chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (bgResponse) => {
                        if (bgResponse?.width && bgResponse?.height) {
                            console.log(`Resolución reciente obtenida: ${bgResponse.width}x${bgResponse.height}`);
                            resolutionSpan.textContent = `${bgResponse.width}x${bgResponse.height} (reciente)`;
                            statusSpan.textContent = "OK";
                        } else {
                            console.log("No hay resolución reciente disponible");
                            resolutionSpan.textContent = "No disponible";
                            statusSpan.textContent = "No soportada";
                        }
                    });
                    return;
                }
                if (response?.width && response?.height) {
                    console.log(`Resolución obtenida: ${response.width}x${response.height}`);
                    resolutionSpan.textContent = `${response.width}x${response.height}`;
                    // Consultar calidad si es YouTube
                    if (tab.url?.includes("youtube.com")) {
                        chrome.runtime.sendMessage({ type: "GET_LAST_QUALITY" }, (qualityResponse) => {
                            if (qualityResponse?.quality) {
                                statusSpan.textContent = `Forzando ${qualityResponse.quality}`;
                            } else {
                                statusSpan.textContent = "OK";
                            }
                        });
                    } else {
                        statusSpan.textContent = "OK";
                    }
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
        console.log("Botón 'Actualizar resolución' clicado");
        refreshButton.disabled = true;
        updateResolution();
        setTimeout(() => {
            refreshButton.disabled = false;
        }, 1000); // Rehabilitar tras 1s
    });
});