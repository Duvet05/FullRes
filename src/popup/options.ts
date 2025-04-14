document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM con tipos
    const platformCheckboxes = document.querySelectorAll(".platform-checkbox") as NodeListOf<HTMLInputElement>;
    const defaultResolutionSelect = document.getElementById("defaultResolution") as HTMLSelectElement | null;
    const defaultCustomResolution = document.getElementById("defaultCustomResolution") as HTMLDivElement | null;
    const defaultWidthInput = document.getElementById("defaultWidth") as HTMLInputElement | null;
    const defaultHeightInput = document.getElementById("defaultHeight") as HTMLInputElement | null;
    const defaultDprInput = document.getElementById("defaultDpr") as HTMLInputElement | null;
    const activateOnLoadCheckbox = document.getElementById("activateOnLoad") as HTMLInputElement | null;
    const saveSettingsButton = document.getElementById("saveSettings") as HTMLButtonElement | null;
    const restoreDefaultsButton = document.getElementById("restoreDefaults") as HTMLButtonElement | null;
    const clearLogsButton = document.getElementById("clearLogs") as HTMLButtonElement | null;
    const exportLogsButton = document.getElementById("exportLogs") as HTMLButtonElement | null;
    const logViewer = document.getElementById("logViewer") as HTMLDivElement | null;
    const activatedPagesSpan = document.getElementById("activatedPages") as HTMLSpanElement | null;
    const detectedImprovementsSpan = document.getElementById("detectedImprovements") as HTMLSpanElement | null;
    const reportIssueLink = document.getElementById("reportIssue") as HTMLAnchorElement | null;
    const viewPrivacyLink = document.getElementById("viewPrivacy") as HTMLAnchorElement | null;

    // Interfaz para la configuración
    interface Settings {
        platforms: {
            netflix: boolean;
            hbomax: boolean;
            disney: boolean;
            youtube: boolean;
            primevideo: boolean;
            hulu: boolean;
        };
        defaultResolution: string;
        customResolution: {
            width: number;
            height: number;
            dpr: number;
        };
        activateOnLoad: boolean;
        stats: {
            activatedPages: number;
            detectedImprovements: number;
        };
        logs: Array<{
            message: string;
            type: string;
            timestamp: number;
        }>;
    }

    // Estado inicial
    let settings: Settings = {
        platforms: {
            netflix: true,
            hbomax: true,
            disney: true,
            youtube: true,
            primevideo: true,
            hulu: false
        },
        defaultResolution: "4k",
        customResolution: {
            width: 3840,
            height: 2160,
            dpr: 2.0
        },
        activateOnLoad: true,
        stats: {
            activatedPages: 0,
            detectedImprovements: 0
        },
        logs: []
    };

    // Cargar configuración guardada
    const loadSettings = (): void => {
        chrome.storage.local.get("fullResSettings", (result: { fullResSettings?: Settings }) => {
            if (result.fullResSettings) {
                settings = { ...settings, ...result.fullResSettings };
                updateUIFromSettings();
            } else {
                // Si no hay configuración guardada, guardar los valores predeterminados
                saveSettings();
            }
        });

        // Cargar estadísticas
        chrome.storage.local.get("fullResStats", (result: { fullResStats?: Settings['stats'] }) => {
            if (result.fullResStats) {
                settings.stats = result.fullResStats;
                updateStats();
            }
        });

        // Cargar logs
        chrome.storage.local.get("fullResLogs", (result: { fullResLogs?: Settings['logs'] }) => {
            if (result.fullResLogs) {
                settings.logs = result.fullResLogs;
                updateLogs();
            }
        });
    };

    // Actualizar interfaz desde la configuración
    const updateUIFromSettings = (): void => {
        // Actualizar checkboxes de plataformas
        for (const platform in settings.platforms) {
            const checkbox = document.getElementById(platform) as HTMLInputElement | null;
            if (checkbox) {
                checkbox.checked = settings.platforms[platform as keyof Settings['platforms']];
            }
        }

        // Actualizar configuración de resolución predeterminada
        if (defaultResolutionSelect) {
            defaultResolutionSelect.value = settings.defaultResolution;
        }
        if (defaultCustomResolution) {
            defaultCustomResolution.classList.toggle("hidden", settings.defaultResolution !== "custom");
        }

        // Actualizar valores personalizados
        if (defaultWidthInput) defaultWidthInput.value = settings.customResolution.width.toString();
        if (defaultHeightInput) defaultHeightInput.value = settings.customResolution.height.toString();
        if (defaultDprInput) defaultDprInput.value = settings.customResolution.dpr.toString();

        // Actualizar activación automática
        if (activateOnLoadCheckbox) activateOnLoadCheckbox.checked = settings.activateOnLoad;

        // Actualizar estadísticas
        updateStats();

        // Actualizar logs
        updateLogs();
    };

    // Actualizar estadísticas en la interfaz
    const updateStats = (): void => {
        if (activatedPagesSpan) activatedPagesSpan.textContent = settings.stats.activatedPages.toString();
        if (detectedImprovementsSpan) detectedImprovementsSpan.textContent = settings.stats.detectedImprovements.toString();
    };

    // Actualizar logs en la interfaz
    const updateLogs = (): void => {
        if (!logViewer) return;

        if (settings.logs.length === 0) {
            logViewer.innerHTML = '<div class="log-entry">No hay registros disponibles</div>';
            return;
        }

        logViewer.innerHTML = '';

        // Mostrar solo los últimos 50 logs (para no sobrecargar la interfaz)
        const logsToShow = settings.logs.slice(-50);

        logsToShow.forEach((log) => {
            const logEntry = document.createElement("div");
            logEntry.className = "log-entry";

            // Formatear timestamp
            const timestamp = new Date(log.timestamp);
            const formattedTime = timestamp.toLocaleString();

            // Determinar color según el tipo de log
            let logClass = "";
            if (log.type === "error") {
                logClass = "log-error";
            } else if (log.type === "warning") {
                logClass = "log-warning";
            } else if (log.type === "success") {
                logClass = "log-success";
            }

            logEntry.className = `log-entry ${logClass}`;
            logEntry.textContent = `[${formattedTime}] ${log.message}`;
            logViewer.appendChild(logEntry);
        });

        // Desplazar al final
        logViewer.scrollTop = logViewer.scrollHeight;
    };

    // Guardar configuración
    const saveSettings = (): void => {
        // Recopilar configuración desde la interfaz
        settings.platforms = {
            netflix: false,
            hbomax: false,
            disney: false,
            youtube: false,
            primevideo: false,
            hulu: false
        };
        platformCheckboxes.forEach((checkbox) => {
            settings.platforms[checkbox.id as keyof Settings['platforms']] = checkbox.checked;
        });

        if (defaultResolutionSelect) settings.defaultResolution = defaultResolutionSelect.value;
        settings.customResolution = {
            width: parseInt(defaultWidthInput?.value || '') || 3840,
            height: parseInt(defaultHeightInput?.value || '') || 2160,
            dpr: parseFloat(defaultDprInput?.value || '') || 2.0
        };

        if (activateOnLoadCheckbox) settings.activateOnLoad = activateOnLoadCheckbox.checked;

        // Guardar en el almacenamiento local
        chrome.storage.local.set({ "fullResSettings": settings }, () => {
            // Añadir log de éxito
            addLog("Configuración guardada correctamente", "success");

            // Notificar al background script sobre el cambio de configuración
            chrome.runtime.sendMessage({
                type: "SETTINGS_UPDATED",
                data: settings
            });

            // Mostrar mensaje de éxito
            showSaveConfirmation();
        });
    };

    // Restaurar valores predeterminados
    const restoreDefaults = (): void => {
        if (confirm("¿Estás seguro de que deseas restaurar la configuración a los valores predeterminados? Esta acción no se puede deshacer.")) {
            settings = {
                platforms: {
                    netflix: true,
                    hbomax: true,
                    disney: true,
                    youtube: true,
                    primevideo: true,
                    hulu: false
                },
                defaultResolution: "4k",
                customResolution: {
                    width: 3840,
                    height: 2160,
                    dpr: 2.0
                },
                activateOnLoad: true,
                stats: settings.stats, // Mantener estadísticas
                logs: settings.logs // Mantener logs
            };

            // Actualizar interfaz
            updateUIFromSettings();

            // Guardar configuración restaurada
            chrome.storage.local.set({ "fullResSettings": settings }, () => {
                addLog("Configuración restaurada a valores predeterminados", "info");

                // Notificar al background script
                chrome.runtime.sendMessage({
                    type: "SETTINGS_UPDATED",
                    data: settings
                });

                // Mostrar mensaje de éxito
                showSaveConfirmation();
            });
        }
    };

    // Limpiar logs
    const clearLogs = (): void => {
        if (confirm("¿Estás seguro de que deseas eliminar todos los registros de actividad? Esta acción no se puede deshacer.")) {
            settings.logs = [];

            // Actualizar interfaz
            updateLogs();

            // Guardar logs vacíos
            chrome.storage.local.set({ "fullResLogs": [] }, () => {
                // Mensaje de confirmación
                alert("Registros eliminados correctamente");
            });
        }
    };

    // Exportar logs
    const exportLogs = (): void => {
        if (settings.logs.length === 0) {
            alert("No hay registros disponibles para exportar");
            return;
        }

        // Crear texto de logs para exportar
        const logsText = settings.logs.map((log) => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            return `[${timestamp}] [${log.type}] ${log.message}`;
        }).join('\n');

        // Crear blob y descargar
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fullres-logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Añadir nuevo log
    const addLog = (message: string, type: string = "info"): void => {
        const log = {
            message,
            type,
            timestamp: Date.now()
        };

        settings.logs.push(log);

        // Limitar a 500 logs para no sobrecargar el almacenamiento
        if (settings.logs.length > 500) {
            settings.logs = settings.logs.slice(-500);
        }

        // Guardar logs
        chrome.storage.local.set({ "fullResLogs": settings.logs }, () => {
            updateLogs();
        });
    };

    // Mostrar confirmación de guardado
    const showSaveConfirmation = (): void => {
        const confirmationEl = document.createElement("div");
        confirmationEl.className = "save-confirmation";
        confirmationEl.textContent = "¡Configuración guardada correctamente!";

        document.body.appendChild(confirmationEl);

        // Animar entrada
        setTimeout(() => {
            confirmationEl.classList.add("show");
        }, 10);

        // Animar salida y eliminar
        setTimeout(() => {
            confirmationEl.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(confirmationEl);
            }, 300);
        }, 3000);
    };

    // Eventos
    defaultResolutionSelect?.addEventListener("change", () => {
        const isCustom = defaultResolutionSelect.value === "custom";
        if (defaultCustomResolution) defaultCustomResolution.classList.toggle("hidden", !isCustom);
    });

    // Eventos de botones
    saveSettingsButton?.addEventListener("click", saveSettings);
    restoreDefaultsButton?.addEventListener("click", restoreDefaults);
    clearLogsButton?.addEventListener("click", clearLogs);
    exportLogsButton?.addEventListener("click", exportLogs);

    // Enlaces
    reportIssueLink?.addEventListener("click", (e: Event) => {
        e.preventDefault();
        alert("Para reportar un problema, por favor envía un correo a soporte@fullres.example.com");
    });

    viewPrivacyLink?.addEventListener("click", (e: Event) => {
        e.preventDefault();
        alert("FullRes respeta tu privacidad. La extensión solo modifica la resolución detectada en sitios de streaming y no recopila ningún dato personal.");
    });

    // Añadimos estilos adicionales para la notificación de guardado
    const style = document.createElement("style");
    style.textContent = `
      .save-confirmation {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--success);
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
      }

      .save-confirmation.show {
        transform: translateY(0);
        opacity: 1;
      }

      .log-error {
        color: var(--error);
      }

      .log-warning {
        color: var(--warning);
      }

      .log-success {
        color: var(--success);
      }
    `;
    document.head.appendChild(style);

    // Cargar configuración al iniciar
    loadSettings();
});