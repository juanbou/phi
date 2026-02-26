// --- Deterministic Pseudo-Random Number Generator (PRNG) ---
// Mulberry32 PRNG
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Global fixed seed for backgrounds so they are identical every time
const bgRandom = mulberry32(123456789);

document.addEventListener('DOMContentLoaded', () => {

    // --- Loading Global Settings ---
    const appSettings = window.PhiStorage ? window.PhiStorage.getSettings() : null;
    let forceWords = ["ILUSION", "MISTERIO", "DESTINO", "ARTE", "MAGIA", "LUZ"]; // fallback
    let fillerWords = ["TIEMPO", "ALMA", "ESPIRITU", "MENTE", "ENERGIA", "UNIVERSO"]; // fallback
    if (appSettings) {
        forceWords = window.PhiStorage.getForceWordsArray();
        fillerWords = window.PhiStorage.getFillerWordsArray();

        // Inject MOABT text if on Context page
        const moabtArticle = document.getElementById('moabtArticle');
        if (moabtArticle) {
            moabtArticle.innerHTML = `<p class="article-text">${appSettings.moabtText}</p>`;
        }
    }

    // --- Secret Settings Trigger Logic (5 clicks) ---
    const secretTriggers = document.querySelectorAll('.secret-trigger');
    let clickCount = 0;
    let clickTimer = null;

    secretTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                window.location.href = 'settings.html';
            }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000); // 1 second window to do 5 clicks
        });
    });

    // --- Page 1: Phi Decimals Logic ---
    const phiInput = document.getElementById('phiInput');
    const searchPhiBtn = document.getElementById('searchPhiBtn');
    const phiResult = document.getElementById('phiResult');
    const decimalsBg = document.getElementById('decimalsBg');

    if (decimalsBg) {
        // Generate deterministic phi-like decimals for background effect
        let phiStr = "1.61803398874989484820458683436563811772030917980576286213544862270526046281890";
        for (let i = 0; i < 800; i++) {
            phiStr += Math.floor(bgRandom() * 10).toString();
        }
        decimalsBg.innerText = phiStr;
    }

    if (searchPhiBtn && phiInput) {
        searchPhiBtn.addEventListener('click', () => {
            const val = phiInput.value.trim();
            if (!val) return;

            // Phase 3 Special Logic: 3-digit number where sum = 14
            let isMagicSum = false;
            let magicSumPos = "";
            if (val.length === 3) {
                const a = parseInt(val[0]);
                const b = parseInt(val[1]);
                const c = parseInt(val[2]);
                if (!isNaN(a) && !isNaN(b) && !isNaN(c) && (a + b + c === 14)) {
                    isMagicSum = true;
                    // Formula requested: (10-b) 0 a
                    const firstPart = (10 - b).toString();
                    magicSumPos = firstPart + "0" + a.toString();
                }
            }

            let magicPosition = "";

            if (isMagicSum) {
                magicPosition = magicSumPos;
            } else {
                // Formatting: Normal Encoding Logic
                let encodedMid = "";
                let inputSeed = 0; // Create deterministic padding based on user input
                for (let i = 0; i < val.length; i++) {
                    const digit = parseInt(val[i]);
                    if (!isNaN(digit)) {
                        encodedMid += (9 - digit).toString();
                        inputSeed += digit * Math.pow(10, i);
                    }
                }

                if (encodedMid.length === 0) return;

                // Deterministic padding specific to the input number
                const paddingRNG = mulberry32(inputSeed + 987654);
                const r1 = Math.floor(paddingRNG() * 90 + 10).toString(); // 2 random digits
                const r2 = Math.floor(paddingRNG() * 900 + 100).toString(); // 3 random digits
                magicPosition = r1 + encodedMid + r2;
            }

            // Log numeric search to history
            if (window.PhiStorage && !isMagicSum) {
                window.PhiStorage.addSearchHistory('NUM', val);
            }

            phiResult.innerText = "Calculando...";
            phiResult.classList.remove('highlight');

            // Phase 6: Decimal Injection & Highlight
            injectAndHighlightNumber(val);

            setTimeout(() => {
                phiResult.innerHTML = `Número encontrado en el decimal <strong style="font-size:1.8rem; letter-spacing:2px; margin-left: 10px;">${magicPosition}</strong>`;
                phiResult.classList.add('highlight');
            }, 1200);
        });
    }

    // Phase 6 function to inject and center exactly like words
    function injectAndHighlightNumber(targetNumber) {
        if (!decimalsBg) return;

        // Generate a fresh set of deterministic-looking numbers
        const pRNG = mulberry32(Math.floor(Math.random() * 1000000));
        let phiStr = "1.61803398874989484820458683436563811772030917980576286213544862270526046281890";
        for (let i = 0; i < 800; i++) {
            phiStr += Math.floor(pRNG() * 10).toString();
        }

        // Absolute Centering: calculate the direct middle of the numerical grid
        const injectPos = Math.floor((phiStr.length - targetNumber.length) / 2);

        const before = phiStr.substring(0, injectPos);
        const after = phiStr.substring(injectPos + targetNumber.length);

        // Inject the payload wrapped in the golden span
        decimalsBg.innerHTML = `${before}<span class="word-highlight" id="targetNumHighlight">${targetNumber}</span>${after}`;

        // Automatically scroll down so the perfectly centered highlight is visible
        setTimeout(() => {
            const highlightMatch = document.getElementById('targetNumHighlight');
            if (highlightMatch) {
                highlightMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                decimalsBg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    // --- Phase 7: Secret History Peek Overlay ---
    const subtitles = document.querySelectorAll('.subtitle');
    let peekTimer = null;
    let isPeeking = false;

    // Build the dynamic overlay container
    const peekOverlay = document.createElement('div');
    peekOverlay.className = 'peek-overlay';
    peekOverlay.innerHTML = `
        <h2>REGISTRO VITAL</h2>
        <div class="peek-history-list" id="peekHistoryList"></div>
    `;
    document.body.appendChild(peekOverlay);

    // Dismiss overlay on any click
    peekOverlay.addEventListener('click', () => {
        peekOverlay.classList.remove('active');
        isPeeking = false;
    });

    subtitles.forEach(subtitle => {
        const startPeekTimer = (e) => {
            // Prevent default zooming/selection on mobile
            if (e.type === 'touchstart') e.preventDefault();

            peekTimer = setTimeout(() => {
                if (!isPeeking && window.PhiStorage) {
                    showPeekOverlay();
                }
            }, 2000); // 2 full seconds hold
        };

        const cancelPeekTimer = () => {
            clearTimeout(peekTimer);
        };

        subtitle.addEventListener('mousedown', startPeekTimer);
        subtitle.addEventListener('touchstart', startPeekTimer, { passive: false });

        subtitle.addEventListener('mouseup', cancelPeekTimer);
        subtitle.addEventListener('mouseleave', cancelPeekTimer);
        subtitle.addEventListener('touchend', cancelPeekTimer);
        subtitle.addEventListener('touchcancel', cancelPeekTimer);
    });

    function showPeekOverlay() {
        isPeeking = true;
        const listContainer = document.getElementById('peekHistoryList');
        const history = window.PhiStorage.getSearchHistory();

        listContainer.innerHTML = '';
        if (history.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Sin registros.</p>';
        } else {
            history.forEach(item => {
                listContainer.innerHTML += `
                    <div class="peek-item">
                        <div class="peek-item-type">${item.type} <span style="font-size:0.7rem; opacity:0.5; margin-left:10px;">${item.time}</span></div>
                        <div class="peek-item-val">${item.value}</div>
                    </div>
                `;
            });
        }

        // Vibrate if supported to confirm trigger to the magician
        if (navigator.vibrate) { navigator.vibrate(50); }

        peekOverlay.classList.add('active');
    }
    // --- Page 2: Word Matrix Logic ---
    const searchWordsBtn = document.getElementById('searchWordsBtn');
    const searchWordBtn = document.getElementById('searchWordBtn');
    const wordSearchInput = document.getElementById('wordSearchInput');
    const wordsResult = document.getElementById('wordsResult');
    const lettersBg = document.getElementById('lettersBg');

    // Grid generation (Deterministic)
    function generateMatrixString() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let grid = "";
        for (let i = 0; i < 1000; i++) {
            grid += chars.charAt(Math.floor(bgRandom() * chars.length));
        }
        return grid;
    }

    if (lettersBg) {
        lettersBg.innerText = generateMatrixString();
    }

    // Original: Scan matrix for force words (Now generating 100 words list)
    if (searchWordsBtn) {
        searchWordsBtn.addEventListener('click', () => {
            lettersBg.classList.add('scanning');
            wordsResult.innerHTML = "Analizando matriz de letras...<br><span style='font-size:0.8rem; color:var(--text-muted)'>buscando patrones complejos</span>";
            wordsResult.classList.remove('highlight');
            searchWordsBtn.disabled = true;

            // Remove any previous highlights from word searches
            const highlights = lettersBg.querySelectorAll('.word-highlight');
            highlights.forEach(el => {
                el.outerHTML = el.innerHTML; // Remove span, keep text
            });

            setTimeout(() => {
                lettersBg.classList.remove('scanning');

                // Build 100 words list
                let finalWordsList = [...forceWords];
                let fillerIndex = 0;
                // Safety check if fillerWords is empty somehow
                const fallbackFiller = fillerWords.length > 0 ? fillerWords : ["PATTERN", "MATRIX", "CODE"];

                while (finalWordsList.length < 100) {
                    finalWordsList.push(fallbackFiller[fillerIndex % fallbackFiller.length]);
                    fillerIndex++;
                }

                // Format as a scrollable numbered list
                let htmlList = `<div class="word-list-container">`;
                finalWordsList.forEach((word, index) => {
                    htmlList += `<div class="word-list-item"><span class="word-index">${index + 1}.</span> ${word}</div>`;
                });
                htmlList += `</div>`;

                wordsResult.innerHTML = `Patrones encontrados (100 resultados):${htmlList}`;
                wordsResult.classList.add('highlight');
                searchWordsBtn.disabled = false;
            }, 2500);
        });
    }

    // New: Calculate Position based on Word (Alphabetical position strict 2-digits)
    if (searchWordBtn && wordSearchInput) {
        searchWordBtn.addEventListener('click', () => {
            const val = wordSearchInput.value.trim().toUpperCase();
            if (!val) return;

            // Alphabetical position calculation (A=01, B=02, ..., Z=26 strict 2-digits)
            let encodedMid = "";
            for (let i = 0; i < val.length; i++) {
                const charCode = val.charCodeAt(i);
                if (charCode >= 65 && charCode <= 90) { // A-Z
                    const pos = charCode - 64;
                    // Pad with leading zero if single digit
                    encodedMid += pos < 10 ? `0${pos}` : pos.toString();
                }
            }

            if (encodedMid.length === 0) return;

            // Phase 4: Strip leading zero if it exists
            if (encodedMid.startsWith("0")) {
                encodedMid = encodedMid.substring(1);
            }

            // Phase 7: Log word search to history
            if (window.PhiStorage) {
                window.PhiStorage.addSearchHistory('PALABRA', val);
            }

            // Feature C: Inject and highlight word in a completely regenerated Matrix
            injectAndHighlightWord(val);

            lettersBg.classList.add('scanning');
            wordsResult.innerText = "Calculando posición en codificación alfa-numérica...";
            wordsResult.classList.remove('highlight');
            searchWordBtn.disabled = true;

            setTimeout(() => {
                lettersBg.classList.remove('scanning');
                wordsResult.innerHTML = `Posición de origen: <br><strong style="font-size:1.8rem; letter-spacing:2px;">${encodedMid}</strong>`;
                wordsResult.classList.add('highlight');
                searchWordBtn.disabled = false;
            }, 1500);
        });
    }

    // Feature C function (Regenerates matrix & injects)
    function injectAndHighlightWord(word) {
        if (!lettersBg) return;

        // Phase 4 Requirement: Generate a completely new matrix background for every search to simulate scanning a new section
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let newGridText = "";
        for (let i = 0; i < 1000; i++) {
            newGridText += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Absolute Centering: calculate the direct middle of the grid
        const injectPos = Math.floor((newGridText.length - word.length) / 2);

        const before = newGridText.substring(0, injectPos);
        const after = newGridText.substring(injectPos + word.length);

        lettersBg.innerHTML = `${before}<span class="word-highlight" id="targetWordHighlight">${word}</span>${after}`;

        // Automatically scroll down so the perfectly centered highlight is visible to the spectator
        setTimeout(() => {
            const highlightMatch = document.getElementById('targetWordHighlight');
            if (highlightMatch) {
                // By targeting the span, the browser will internally scroll the max-height grid
                highlightMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                lettersBg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
});
