// Listen for translate requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate") {
        translateText(request.text).then(sendResponse);
        return true; // Keep the message channel open for async response
    }
});

// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === "translate-text") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "translate-shortcut",
                });
            }
        });
    }
});

// Main translation function with key rotation
async function translateText(text) {
    try {
        // Get settings from storage
        const data = await chrome.storage.sync.get([
            "apiKeys",
            "targetLang",
            "currentKeyIndex",
        ]);

        if (!data.apiKeys || data.apiKeys.length === 0) {
            return {
                success: false,
                error: "Vui lòng cài đặt API key trong extension settings",
            };
        }

        const apiKeys = data.apiKeys;
        const targetLang = data.targetLang || "vi";
        let currentKeyIndex = data.currentKeyIndex || 0;

        // Try each key in rotation
        let lastError = null;
        for (let attempt = 0; attempt < apiKeys.length; attempt++) {
            const apiKey = apiKeys[currentKeyIndex];

            try {
                const translation = await callGeminiAPI(
                    apiKey,
                    text,
                    targetLang
                );

                // Success! Save the current key index
                await chrome.storage.sync.set({ currentKeyIndex });

                return {
                    success: true,
                    translation: translation,
                };
            } catch (error) {
                lastError = error.message;
                console.log(`Key ${currentKeyIndex} failed: ${error.message}`);

                // Rotate to next key
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                await chrome.storage.sync.set({ currentKeyIndex });
            }
        }

        // All keys failed
        return {
            success: false,
            error: `Tất cả API keys đều thất bại. Lỗi cuối: ${lastError}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

// Call Google Gemini API
async function callGeminiAPI(apiKey, text, targetLang) {
    const langNames = {
        vi: "Vietnamese",
        en: "English",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        fr: "French",
        de: "German",
        es: "Spanish",
    };

    const targetLangName = langNames[targetLang] || "Vietnamese";

    const prompt = `Translate the following text to ${targetLangName}. Only return the translation without any explanation or additional text:\n\n${text}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
            throw new Error("API key đã hết quota (429)");
        } else if (response.status === 403) {
            throw new Error("API key không hợp lệ (403)");
        } else {
            throw new Error(
                `API error: ${response.status} - ${
                    errorData.error?.message || "Unknown error"
                }`
            );
        }
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
    } else {
        throw new Error("Không nhận được kết quả dịch từ API");
    }
}
