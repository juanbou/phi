// Default settings
const DEFAULT_SETTINGS = {
    forceWords: "ILUSION, MISTERIO, DESTINO, ARTE, MAGIA, LUZ",
    fillerWords: "TIEMPO, ALMA, ESPIRITU, MENTE, ENERGIA, UNIVERSO, VERDAD, OCULTO, MISTICO, CIENCIA, CREER, FE, SUERTE, AZAR, DESTINO, PODER, VISION, FUTURO, PASADO, AHORA, RELOJ, NUMERO, LETRA, ESPACIO, VACIO, LUZ, SOMBRA, ETERNO, INFINITO, CAOS, ORDEN, FORMA, CUBO, ESFERA, LINEA, PUNTO, PLANETA, ESTRELLA, SOL, LUNA, ATOMO, CELULA, FUEGO, AGUA, TIERRA, AIRE, ROJO, AZUL, VERDE, ORO, PLATA, COBRE, METAL, CRISTAL, ESPEJO, REFLEJO, ECO, SONIDO, SILENCIO, VIBRACION, ONDA, FRECUENCIA, SINTONIA, MENTAL, IDEA, PENSAMIENTO, RAZON, LOGICA, CREACION, ORIGEN, FIN, PRINCIPIO, FINAL, CAMINO, RUTA, VIAJE, PUERTA, LLAVE, MISTERIO, SECRETO, ENIGMA, ACERTIJO, CLAVE, RESPUESTA, PREGUNTA, DUDA, CERTEZA",
    moabtText: "El dato phi es una proporción sin par. Su tamaño real no se sabe, pues es irracional y sin fin. La ciencia ve su paso en el todo.\n\nNo es arte, es un modelo de la naturaleza. Su uso da un óptimo plan al caos. En la botánica, guía el giro de la flor. La sucesión de dos a dos da el gran paso.\n\nUn girasol une sus hojas en una espiral. Ese ángulo le da luz y más sol. En un jardín o en el universo, la red es tal cual.\n\nLa división de la suma es la base de su ser. Como dijo Kepler, es la joya de la red. Las líneas de un ente fractal van a la par.\n\nDa vida a las yemas. Su relación une a las zonas en paz. Quizás es una verdad que se nota al ver más allá."
};

// Storage utilities
const StorageManager = {
    getSettings: () => {
        const saved = localStorage.getItem('phiMagicSettings');
        if (saved) {
            try {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse settings", e);
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    },

    saveSettings: (settings) => {
        localStorage.setItem('phiMagicSettings', JSON.stringify(settings));
    },

    getForceWordsArray: () => {
        const settings = StorageManager.getSettings();
        return settings.forceWords.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "");
    },
    getFillerWordsArray: () => {
        const settings = StorageManager.getSettings();
        return settings.fillerWords.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "");
    },

    // Phase 7: History Peek Tracking
    getSearchHistory: () => {
        const saved = localStorage.getItem('phiMagicHistory');
        return saved ? JSON.parse(saved) : [];
    },

    addSearchHistory: (type, value) => {
        let history = StorageManager.getSearchHistory();
        history.unshift({ type, value, time: new Date().toLocaleTimeString() });
        // Keep only the last 10
        if (history.length > 10) { history = history.slice(0, 10); }
        localStorage.setItem('phiMagicHistory', JSON.stringify(history));
    }
};

// Initialize Settings Page Logic (only runs on settings.html)
document.addEventListener('DOMContentLoaded', () => {
    const forceWordsInput = document.getElementById('forceWordsInput');
    const fillerWordsInput = document.getElementById('fillerWordsInput');
    const moabtTextInput = document.getElementById('moabtTextInput');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (forceWordsInput && moabtTextInput && fillerWordsInput && saveBtn) {
        // Load current
        const currentSettings = StorageManager.getSettings();
        forceWordsInput.value = currentSettings.forceWords;
        fillerWordsInput.value = currentSettings.fillerWords;
        moabtTextInput.value = currentSettings.moabtText.replace(/<br><br>/g, '\n\n');

        // Save action
        saveBtn.addEventListener('click', () => {
            const newSettings = {
                forceWords: forceWordsInput.value,
                fillerWords: fillerWordsInput.value,
                moabtText: moabtTextInput.value.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')
            };
            StorageManager.saveSettings(newSettings);

            saveBtn.innerText = "Saved!";
            saveBtn.style.background = "#4CAF50";
            saveBtn.style.color = "white";

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });

        // Cancel action
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Reset action
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm("¿Estás seguro de que quieres borrar todos los ajustes y restaurar los valores por defecto (incluyendo tu texto secreto actual)?")) {
                    localStorage.removeItem('phiMagicSettings');
                    window.location.reload();
                }
            });
        }
    }
});

// Export StorageManager for use in app.js if needed globally
window.PhiStorage = StorageManager;
