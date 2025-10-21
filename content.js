// Variables
let translateButton = null;
let modal = null;
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

// Create modal
function createModal() {
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "ai-translate-modal";
    modal.innerHTML = `
    <div class="ai-modal-content">
      <div class="ai-modal-header">
        <span class="ai-modal-title">🌐 Bản dịch</span>
        <button class="ai-modal-close">&times;</button>
      </div>
      <div class="ai-modal-body">
        <div class="ai-original">
          <strong>Gốc:</strong>
          <div class="ai-text"></div>
        </div>
        <div class="ai-translated">
          <strong>Dịch:</strong>
          <div class="ai-text"></div>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);

    modal.querySelector(".ai-modal-close").addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    return modal;
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

    const modalEl = createModal();
    const originalDiv = modalEl.querySelector(".ai-original .ai-text");
    const translatedDiv = modalEl.querySelector(".ai-translated .ai-text");

    originalDiv.textContent = selectedText;
    translatedDiv.innerHTML = '<div class="ai-loading">Đang dịch...</div>';
    modalEl.style.display = "flex";
    hideTranslateButton();

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

// Listen for keyboard shortcut
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
createModal();
