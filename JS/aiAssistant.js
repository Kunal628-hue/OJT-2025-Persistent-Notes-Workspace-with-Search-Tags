export function wireAIAssistant() {
    const generateBtn = document.getElementById("ai-sidebar-generate");
    const promptInput = document.getElementById("ai-sidebar-prompt");
    const contentEditor = document.getElementById("content");

    const micBtn = document.getElementById("ai-mic-btn");

    if (!generateBtn || !promptInput) return;

    // --- Voice Input Logic ---
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            micBtn.addEventListener("click", () => {
                if (micBtn.classList.contains("listening")) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });

            recognition.onstart = () => {
                micBtn.classList.add("listening");
                promptInput.placeholder = "Listening...";
            };

            recognition.onend = () => {
                micBtn.classList.remove("listening");
                promptInput.placeholder = "Ask AI to write...";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                // Append text ensuring a space if needed
                const currentText = promptInput.value;
                promptInput.value = currentText + (currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '') + transcript;
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                micBtn.classList.remove("listening");
                promptInput.placeholder = "Error. Try typing.";
                setTimeout(() => {
                    promptInput.placeholder = "Ask AI to write...";
                }, 2000);
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            micBtn.style.display = "none"; // Hide if not supported
        }
    }

    // --- Generate Logic ---
    generateBtn.addEventListener("click", async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        // UI Loading State
        const originalText = generateBtn.textContent;
        generateBtn.textContent = "⏳ Thinking...";
        generateBtn.disabled = true;
        promptInput.disabled = true;

        try {
            const text = await mockAIGenerate(prompt);
            insertTextAtCursor(text);
            promptInput.value = ""; // Clear after success
        } catch (err) {
            console.error("AI Generation failed", err);
            alert("Failed to generate text. Please try again.");
        } finally {
            // Reset UI
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
            promptInput.disabled = false;
        }
    });

    function insertTextAtCursor(text) {
        if (!contentEditor) return;
        contentEditor.focus();

        // Create a new paragraph or simple text node
        try {
            document.execCommand('insertText', false, text);
        } catch (e) {
            // Fallback for modern browsers or if execCommand fails
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    }

    // Mock API Call
    function mockAIGenerate(prompt) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`
[AI Draft]: ${prompt}

Here is a generated response based on your request. 
(This is a mock AI response. In a real app, this would call an LLM API.)
        `.trim());
            }, 1500); // 1.5s delay to feel "real"
        });
    }
}

export function wireSummarizeButton() {
    const summarizeBtn = document.getElementById("ai-summarize-btn");
    const contentEditor = document.getElementById("content");

    if (!summarizeBtn || !contentEditor) return;

    summarizeBtn.addEventListener("click", async () => {
        const currentText = contentEditor.innerText.trim();
        if (!currentText) {
            alert("Please write some text to summarize first!");
            return;
        }

        // UI Loading State
        const originalText = summarizeBtn.innerHTML;
        summarizeBtn.innerHTML = "⏳ Summarizing...";
        summarizeBtn.disabled = true;

        try {
            // Simulate AI Summary
            const summary = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`## 📝 Summary\nHere is a concise summary of the note content:\n- Key point extracted from text.\n- Another important detail.\n\n---\n`);
                }, 1500);
            });

            // Prepend summary
            contentEditor.focus();

            // Create a new range to insert at the beginning
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(contentEditor, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            // Insert
            document.execCommand('insertText', false, summary);

        } catch (err) {
            console.error("Summarization failed", err);
            alert("Failed to summarize note.");
        } finally {
            summarizeBtn.innerHTML = originalText;
            summarizeBtn.disabled = false;
        }
    });
}
