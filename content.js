// Variables
let translateButton = null;
let popup = null;
let selectedText = "";
let selectionRange = null;

// Create translate button
function createTranslateButton() {
    if (translateButton) return translateButton;

    translateButton = document.createElement("div");
    translateButton.id = "ai-translate-btn";
    translateButton.innerHTML = "🌐";
    translateButton.style.display = "none";
    document.body.appendChild(translateButton);

    translateButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await translateSelectedText();
    });

    return translateButton;
}

// Create popup (đã bỏ phần Gốc)
function createPopup() {
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "ai-translate-popup";
    popup.innerHTML = `
        <div class="ai-popup-content">
            <div class="ai-popup-header">
                🌐 <span class="ai-popup-title">Bản dịch</span>
                <button class="ai-popup-close">&times;</button>
            </div>
            <div class="ai-popup-body">
                <div class="ai-translated">
                    <div class="ai-text ai-translated-text"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector(".ai-popup-close").addEventListener("click", () => {
        popup.style.display = "none";
    });

    // ➊ Click ra ngoài -> ẩn popup
    document.addEventListener("mousedown", (e) => {
        if (
            popup.style.display === "block" &&
            !popup.contains(e.target) &&
            !translateButton.contains(e.target)
        ) {
            popup.style.display = "none";
        }
    });

    // ➋ Nhấn ESC -> ẩn popup
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.style.display === "block") {
            popup.style.display = "none";
        }
    });

    return popup;
}

// Show translate button
function showTranslateButton(x, y) {
    const button = createTranslateButton();
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.display = "flex";
}

// Hide translate button
function hideTranslateButton() {
    if (translateButton) {
        translateButton.style.display = "none";
    }
}

// Get selected text and position
document.addEventListener("mouseup", (e) => {
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
            selectedText = text;
            selectionRange = selection.getRangeAt(0);
            const rect = selectionRange.getBoundingClientRect();
            showTranslateButton(
                rect.left + window.scrollX + rect.width / 2 - 20,
                rect.bottom + window.scrollY + 5
            );
        } else {
            hideTranslateButton();
        }
    }, 10);
});

// Translate function
async function translateSelectedText() {
    if (!selectedText) return;

    const popupEl = createPopup();
    const translatedDiv = popupEl.querySelector(".ai-translated-text");

    translatedDiv.innerHTML = '<div class="ai-loading">Đang dịch...</div>';
    hideTranslateButton();

    // Position popup under the selection
    const rect = selectionRange.getBoundingClientRect();
    popupEl.style.left = `${rect.left + window.scrollX}px`;
    popupEl.style.top = `${rect.bottom + window.scrollY + 8}px`;
    popupEl.style.display = "block";

    try {
        const result = await chrome.runtime.sendMessage({
            action: "translate",
            text: selectedText,
        });

        if (result.success) {
            translatedDiv.textContent = result.translation;
        } else {
            translatedDiv.innerHTML = `<div class="ai-error">❌ ${result.error}</div>`;
        }
    } catch (error) {
        translatedDiv.innerHTML = `<div class="ai-error">❌ Lỗi: ${error.message}</div>`;
    }
}

// Listen for keyboard shortcut (Ctrl+Alt+T)
document.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text.length > 0) {
            selectedText = text;
            await translateSelectedText();
        }
    }
});

// Hide button when clicking outside
document.addEventListener("mousedown", (e) => {
    if (translateButton && !translateButton.contains(e.target)) {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection.toString().trim().length === 0) {
                hideTranslateButton();
            }
        }, 10);
    }
});

// Initialize
createTranslateButton();
createPopup();
