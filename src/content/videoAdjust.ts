// videoAdjust.ts
function forceMaxQuality(): void {
    console.log("FullRes: Iniciando ajuste de calidad en YouTube...");

    const video = document.querySelector("video");
    if (!video) {
        console.log("FullRes: No se encontró elemento de video.");
        return;
    }

    const settingsButton = document.querySelector(".ytp-settings-button") as HTMLElement;
    if (!settingsButton) {
        console.log("FullRes: No se encontró botón de ajustes.");
        return;
    }

    const selectMaxQuality = () => {
        settingsButton.click();

        setTimeout(() => {
            const qualityMenuItem = Array.from(document.querySelectorAll(".ytp-menuitem-label"))
                .find((el) => el.textContent?.includes("Quality") || el.textContent?.includes("Calidad"));
            if (!qualityMenuItem) {
                console.log("FullRes: No se encontró opción de 'Calidad'.");
                settingsButton.click(); // Cerrar menú
                return;
            }

            (qualityMenuItem.parentElement as HTMLElement).click();

            // Esperar a que carguen las opciones de calidad
            setTimeout(() => {
                // Obtener todas las opciones de calidad
                const qualityOptions = Array.from(document.querySelectorAll(".ytp-quality-menu .ytp-menuitem-label"));
                if (qualityOptions.length === 0) {
                    console.log("FullRes: No se encontraron opciones de calidad.");
                    settingsButton.click(); // Cerrar menú
                    return;
                }

                const highestQuality = qualityOptions[0] as HTMLElement;
                const qualityText = highestQuality.textContent || "desconocida";
                highestQuality.click();
                console.log(`FullRes: Calidad forzada a ${qualityText}`);

                settingsButton.click();

                chrome.runtime.sendMessage({
                    type: "QUALITY_CHANGED",
                    payload: { quality: qualityText },
                });
            }, 500);
        }, 500);
    };

    selectMaxQuality();

    video.addEventListener("loadeddata", () => {
        console.log("FullRes: Video nuevo detectado, ajustando calidad...");
        selectMaxQuality();
    });
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    forceMaxQuality();
} else {
    document.addEventListener("DOMContentLoaded", forceMaxQuality);
}