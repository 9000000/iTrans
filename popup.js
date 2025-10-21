// Load saved settings
chrome.storage.sync.get(
    ["apiKeys", "targetLang", "currentKeyIndex"],
    (data) => {
        if (data.apiKeys && data.apiKeys.length > 0) {
            document.getElementById("apiKeys").value = data.apiKeys.join("\n");
        }
        if (data.targetLang) {
            document.getElementById("targetLang").value = data.targetLang;
        }
    }
);

// Save settings
document.getElementById("saveBtn").addEventListener("click", () => {
    const apiKeysText = document.getElementById("apiKeys").value.trim();
    const targetLang = document.getElementById("targetLang").value;
    const statusDiv = document.getElementById("status");

    if (!apiKeysText) {
        statusDiv.className = "status error";
        statusDiv.textContent = "❌ Vui lòng nhập ít nhất một API key!";
        return;
    }

    // Split by new lines and filter empty lines
    const apiKeys = apiKeysText
        .split("\n")
        .map((key) => key.trim())
        .filter((key) => key.length > 0);

    if (apiKeys.length === 0) {
        statusDiv.className = "status error";
        statusDiv.textContent = "❌ Vui lòng nhập ít nhất một API key hợp lệ!";
        return;
    }

    // Save to Chrome storage
    chrome.storage.sync.set(
        {
            apiKeys: apiKeys,
            targetLang: targetLang,
            currentKeyIndex: 0,
        },
        () => {
            statusDiv.className = "status success";
            statusDiv.textContent = `✅ Đã lưu thành công! (${
                apiKeys.length
            } API key${apiKeys.length > 1 ? "s" : ""})`;

            setTimeout(() => {
                statusDiv.style.display = "none";
            }, 3000);
        }
    );
});
