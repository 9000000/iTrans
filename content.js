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
    // Dragging state
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const header = popup.querySelector(".ai-popup-header");

    function clampPosition(x, y, popupEl) {
        const pad = 8; // keep some padding from edges
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = popupEl.getBoundingClientRect();
        const maxX = vw - rect.width - pad;
        const maxY = vh - rect.height - pad;
        const nx = Math.min(Math.max(x, pad), Math.max(maxX, pad));
        const ny = Math.min(Math.max(y, pad), Math.max(maxY, pad));
        return { x: nx, y: ny };
    }

    function startDrag(clientX, clientY) {
        const rect = popup.getBoundingClientRect();
        isDragging = true;
        popup.classList.add("ai-dragging");
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
    }

    function onMove(clientX, clientY) {
        if (!isDragging) return;
        let x = clientX - dragOffsetX;
        let y = clientY - dragOffsetY;
        const pos = clampPosition(x, y, popup);
        popup.style.left = pos.x + "px";
        popup.style.top = pos.y + "px";
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        popup.classList.remove("ai-dragging");
        // Persist position (relative to document)
        const left = parseFloat(popup.style.left) || 0;
        const top = parseFloat(popup.style.top) || 0;
        chrome.storage.sync.set({ popupPos: { left, top } });
    }

    // Mouse events
    header.addEventListener("mousedown", (e) => {
        // Only left button
        if (e.button !== 0) return;
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    });

    document.addEventListener("mousemove", (e) => {
        onMove(e.clientX, e.clientY);
    });

    document.addEventListener("mouseup", (e) => {
        endDrag();
    });

    // Touch events
    header.addEventListener(
        "touchstart",
        (e) => {
            const t = e.touches[0];
            if (!t) return;
            e.preventDefault();
            startDrag(t.clientX, t.clientY);
        },
        { passive: false }
    );

    document.addEventListener(
        "touchmove",
        (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            if (!t) return;
            e.preventDefault();
            onMove(t.clientX, t.clientY);
        },
        { passive: false }
    );

    document.addEventListener("touchend", (e) => {
        endDrag();
    });

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

    // Load saved position if any
    const data = await chrome.storage.sync.get(["popupPos"]);
    const saved = data.popupPos;

    if (
        saved &&
        typeof saved.left === "number" &&
        typeof saved.top === "number"
    ) {
        // Use saved position
        popupEl.style.left = saved.left + "px";
        popupEl.style.top = saved.top + "px";
    } else {
        // Position popup under the selection
        const rect = selectionRange.getBoundingClientRect();
        popupEl.style.left = `${rect.left}px`;
        popupEl.style.top = `${rect.bottom + 8}px`;
    }

    // Ensure it's visible and within viewport
    popupEl.style.display = "block";
    const clamped = (function () {
        const pad = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = popupEl.getBoundingClientRect();
        let left = rect.left;
        let top = rect.top;
        const maxLeft = vw - rect.width - pad;
        const maxTop = vh - rect.height - pad;
        left = Math.min(Math.max(left, pad), Math.max(maxLeft, pad));
        top = Math.min(Math.max(top, pad), Math.max(maxTop, pad));
        return { left, top };
    })();

    popupEl.style.left = clamped.left + "px";
    popupEl.style.top = clamped.top + "px";

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
