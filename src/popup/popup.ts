document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM con tipos
    const resolutionSpan = document.getElementById("resolution") as HTMLSpanElement | null;
    const dprSpan = document.getElementById("dpr") as HTMLSpanElement | null;
    const statusSpan = document.getElementById("status") as HTMLSpanElement | null;
    const platformTag = document.getElementById("platformTag") as HTMLSpanElement | null;
    const refreshButton = document.getElementById("refresh") as HTMLButtonElement | null;
    const settingsButton = document.getElementById("settings") as HTMLButtonElement | null;
    const modeToggle = document.getElementById("modeToggle") as HTMLInputElement | null;
    const modeLabel = document.getElementById("modeLabel") as HTMLSpanElement | null;
    const simulatedOptions = document.getElementById("simulatedOptions") as HTMLDivElement | null;
    const resolutionSelect = document.getElementById("resolutionSelect") as HTMLSelectElement | null;
    const customResolution = document.getElementById("customResolution") as HTMLDivElement | null;
    const customWidth = document.getElementById("customWidth") as HTMLInputElement | null;
    const customHeight = document.getElementById("customHeight") as HTMLInputElement | null;
    const customDpr = document.getElementById("customDpr") as HTMLInputElement | null;
    const bitrateSpan = document.getElementById("bitrate") as HTMLSpanElement | null;
    const streamTypeSpan = document.getElementById("streamType") as HTMLSpanElement | null;

    // Estado inicial con tipos
    let currentUrl: string = "";
    let simulationActive: boolean = false;
    let platformCompatible: boolean = false;

    // Interfaz para la respuesta de resolución
    interface ResolutionResponse {
        width?: number;
        height?: number;
        dpr?: string;
    }

    // Interfaz para la información de stream
    interface StreamInfoResponse {
        bitrate?: number;
        streamType?: string;
    }

    // Interfaz para la configuración guardada
    interface SavedConfig {
        simulationActive?: boolean;
        simulatedResolution?: { width: number; height: number; dpr: number };
        customValues?: { width: string; height: string; dpr: string };
        resolutionMode?: string;
    }

    // Función para detectar la plataforma compatible
    const detectPlatform = (url: string): string => {
        if (!url) return "desconocido";

        if (url.includes("netflix.com")) return "Netflix";
        if (url.includes("hbomax.com") || url.includes("max.com")) return "HBO Max";
        if (url.includes("disneyplus.com")) return "Disney+";
        if (url.includes("youtube.com")) return "YouTube";
        if (url.includes("primevideo.com")) return "Prime Video";
        if (url.includes("hulu.com")) return "Hulu";

        return "desconocido";
    };

    // Función para verificar si la plataforma es compatible
    const isPlatformCompatible = (platform: string): boolean => {
        const compatiblePlatforms: string[] = ["Netflix", "HBO Max", "Disney+", "YouTube", "Prime Video"];
        return compatiblePlatforms.includes(platform);
    };

    // Actualizar resolución y calidad
    const updateResolution = (): void => {
        if (statusSpan) {
            statusSpan.textContent = "Cargando...";
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const tab = tabs[0];
            currentUrl = tab?.url || "";

            // Detectar la plataforma y actualizar la etiqueta
            const platform: string = detectPlatform(currentUrl);
            platformCompatible = isPlatformCompatible(platform);

            if (platformTag) {
                platformTag.textContent = platform;
                platformTag.style.backgroundColor = platformCompatible ? "#E0F7FA" : "#FFEBEE";
                platformTag.style.color = platformCompatible ? "#00838F" : "#C62828";
            }

            if (!tab?.id || !tab.url || !tab.url.match(/^https?:\/\//)) {
                handleNoTab();
                return;
            }

            // Enviar mensaje al content script
            chrome.tabs.sendMessage(tab.id, { type: "GET_RESOLUTION" }, (response: ResolutionResponse) => {
                if (chrome.runtime.lastError) {
                    handleContentScriptError();
                    return;
                }

                if (response?.width && response?.height) {
                    if (resolutionSpan) resolutionSpan.textContent = `${response.width}x${response.height}`;
                    if (dprSpan) dprSpan.textContent = response.dpr || "No disponible";

                    if (simulationActive && typeof tab.id === 'number') {
                        updateStreamInfo(tab.id);
                    }
                    // Actualizar estado según la plataforma
                    if (platformCompatible && statusSpan) {
                        statusSpan.textContent = simulationActive ? "Forzando resolución" : "Listo";
                        statusSpan.style.color = simulationActive ? "#00897B" : "#757575";
                    } else if (statusSpan) {
                        statusSpan.textContent = "No compatible";
                        statusSpan.style.color = "#757575";
                    }
                } else {
                    if (resolutionSpan) resolutionSpan.textContent = "No disponible";
                    if (dprSpan) dprSpan.textContent = "No disponible";
                    if (statusSpan) {
                        statusSpan.textContent = "Error";
                        statusSpan.style.color = "#F44336";
                    }
                }
            });
        });
    };

    // Manejar casos donde no hay pestaña o no es compatible
    const handleNoTab = (): void => {
        chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (response: ResolutionResponse) => {
            if (response?.width && response?.height) {
                if (resolutionSpan) resolutionSpan.textContent = `${response.width}x${response.height} (reciente)`;
                if (dprSpan) dprSpan.textContent = response.dpr || "No disponible";
                if (statusSpan) statusSpan.textContent = "No activa";
            } else {
                if (resolutionSpan) resolutionSpan.textContent = "No disponible";
                if (dprSpan) dprSpan.textContent = "No disponible";
                if (statusSpan) statusSpan.textContent = "No compatible";
            }
        });
    };

    // Manejar errores del content script
    const handleContentScriptError = (): void => {
        chrome.runtime.sendMessage({ type: "GET_LAST_RESOLUTION" }, (bgResponse: ResolutionResponse) => {
            if (bgResponse?.width && bgResponse?.height) {
                if (resolutionSpan) resolutionSpan.textContent = `${bgResponse.width}x${bgResponse.height} (reciente)`;
                if (dprSpan) dprSpan.textContent = bgResponse.dpr || "No disponible";
                if (statusSpan) statusSpan.textContent = "No inyectado";
            } else {
                if (resolutionSpan) resolutionSpan.textContent = "No disponible";
                if (dprSpan) dprSpan.textContent = "No disponible";
                if (statusSpan) statusSpan.textContent = "No disponible";
            }
        });
    };

    // Actualizar información de bitrate y tipo de stream
    const updateStreamInfo = (tabId: number): void => {
        chrome.tabs.sendMessage(tabId, { type: "GET_STREAM_INFO" }, (response: StreamInfoResponse) => {
            if (chrome.runtime.lastError || !response) {
                if (bitrateSpan) bitrateSpan.textContent = "No disponible";
                if (streamTypeSpan) streamTypeSpan.textContent = "No disponible";
                return;
            }

            if (response.bitrate && bitrateSpan) {
                bitrateSpan.textContent = `${response.bitrate} Mbps`;
            } else if (bitrateSpan) {
                bitrateSpan.textContent = "No disponible";
            }

            if (response.streamType && streamTypeSpan) {
                streamTypeSpan.textContent = response.streamType === "native" ? "Nativo" : "Escalado";
            } else if (streamTypeSpan) {
                streamTypeSpan.textContent = "No disponible";
            }
        });
    };

    // Función para aplicar la resolución simulada
    const applySimulatedResolution = (): void => {
        if (!simulationActive) return;

        let width: number, height: number, dpr: number;

        if (resolutionSelect?.value === "custom") {
            width = parseInt(customWidth?.value || '') || 3840;
            height = parseInt(customHeight?.value || '') || 2160;
            dpr = parseFloat(customDpr?.value || '') || 2.0;
        } else {
            // Valores predefinidos
            switch (resolutionSelect?.value) {
                case "4k":
                    width = 3840;
                    height = 2160;
                    dpr = 2.0;
                    break;
                case "2k":
                    width = 2560;
                    height = 1440;
                    dpr = 1.5;
                    break;
                case "fullhd":
                    width = 1920;
                    height = 1080;
                    dpr = 1.0;
                    break;
                default:
                    width = 3840;
                    height = 2160;
                    dpr = 2.0;
            }
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const tab = tabs[0];
            if (!tab?.id) return;

            chrome.tabs.sendMessage(tab.id, {
                type: "SET_SIMULATED_RESOLUTION",
                data: { width, height, dpr }
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error al aplicar resolución simulada:", chrome.runtime.lastError);
                    return;
                }

                // Guardar configuración
                chrome.storage.local.set({
                    simulationActive,
                    simulatedResolution: { width, height, dpr },
                    customValues: {
                        width: customWidth?.value || '',
                        height: customHeight?.value || '',
                        dpr: customDpr?.value || ''
                    },
                    resolutionMode: resolutionSelect?.value
                });

                // Actualizar información
                updateResolution();
            });
        });
    };

    // Cargar configuración guardada
    const loadSavedConfig = (): void => {
        chrome.storage.local.get([
            'simulationActive',
            'simulatedResolution',
            'customValues',
            'resolutionMode'
        ], (result: SavedConfig) => {
            if (result.simulationActive !== undefined) {
                simulationActive = result.simulationActive;
                if (modeToggle) modeToggle.checked = simulationActive;
                if (modeLabel) modeLabel.textContent = simulationActive ? "Modo Simulado" : "Resolución Original";
                if (simulatedOptions) simulatedOptions.classList.toggle('hidden', !simulationActive);
            }

            if (result.resolutionMode && resolutionSelect) {
                resolutionSelect.value = result.resolutionMode;
                if (customResolution) customResolution.classList.toggle('hidden', result.resolutionMode !== 'custom');
            }

            if (result.customValues) {
                if (customWidth) customWidth.value = result.customValues.width || '';
                if (customHeight) customHeight.value = result.customValues.height || '';
                if (customDpr) customDpr.value = result.customValues.dpr || '';
            }

            // Aplicar resolución simulada si está activa
            if (simulationActive) {
                applySimulatedResolution();
            }
        });
    };

    // Cargar resolución al abrir
    updateResolution();
    loadSavedConfig();

    // Evento: Botón de actualizar
    refreshButton?.addEventListener("click", () => {
        if (refreshButton) refreshButton.disabled = true;
        updateResolution();

        setTimeout(() => {
            if (refreshButton) refreshButton.disabled = false;
        }, 1000);
    });

    // Evento: Botón de configuración
    settingsButton?.addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    // Evento: Toggle de modo
    modeToggle?.addEventListener("change", () => {
        simulationActive = modeToggle.checked;
        if (modeLabel) modeLabel.textContent = simulationActive ? "Modo Simulado" : "Resolución Original";
        if (simulatedOptions) simulatedOptions.classList.toggle('hidden', !simulationActive);

        if (simulationActive) {
            applySimulatedResolution();
        } else {
            // Restaurar resolución original
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                const tab = tabs[0];
                if (!tab?.id) return;

                chrome.tabs.sendMessage(tab.id, { type: "RESTORE_ORIGINAL_RESOLUTION" }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error al restaurar resolución:", chrome.runtime.lastError);
                        return;
                    }

                    // Guardar configuración
                    chrome.storage.local.set({ simulationActive });

                    // Actualizar información
                    updateResolution();
                });
            });
        }
    });

    // Evento: Cambio en selector de resolución
    resolutionSelect?.addEventListener("change", () => {
        const isCustom: boolean = resolutionSelect.value === "custom";
        if (customResolution) customResolution.classList.toggle('hidden', !isCustom);

        applySimulatedResolution();
    });

    // Eventos: Cambios en valores personalizados
    customWidth?.addEventListener("change", applySimulatedResolution);
    customHeight?.addEventListener("change", applySimulatedResolution);
    customDpr?.addEventListener("change", applySimulatedResolution);
});