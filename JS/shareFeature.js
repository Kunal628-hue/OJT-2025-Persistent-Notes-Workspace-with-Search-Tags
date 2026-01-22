

/**
 * Wires up the Share button and Modal logic.
 * @param {Object} state - The global app state.
 */
export function wireShareFeature(state, callbacks) {
    const shareBtn = document.getElementById('share-note');
    const shareModal = document.getElementById('share-modal');
    const copyBtn = document.getElementById('copy-share-link');
    const linkInput = document.getElementById('share-link-input');
    const closeBtns = shareModal?.querySelectorAll('.close-modal');

    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', async () => {
            // Check if user is logged in
            if (!state.activeUser) {
                const shouldLogin = confirm("You need to be logged in to share notes. Would you like to log in now?");
                if (shouldLogin) {
                    window.location.href = "./HTML/signup.html";
                }
                return;
            }

            // Get the active note
            const activeNote = state.notes.find(n => n.id === state.activeNoteId);
            if (!activeNote) {
                alert("No active note to share.");
                return;
            }

            // Generate the long share link first
            console.log("Generating share link..."); // DEBUG
            const longLink = generateShareLink(activeNote, state.activeUser);

            // Show loading state
            if (linkInput) {
                linkInput.value = "Generating short link...";
                linkInput.disabled = true;
            }
            if (copyBtn) {
                copyBtn.disabled = true;
                copyBtn.textContent = "⏳";
            }

            // Open Modal immediately
            shareModal.showModal();

            try {
                // Attempt to shorten URL
                const shortLink = await shortenUrl(longLink);
                console.log("Using link:", shortLink);

                if (linkInput) {
                    linkInput.value = shortLink;
                    linkInput.disabled = false;
                }

                // Generate QR Code for the final link
                requestAnimationFrame(() => {
                    generateQRCode(shortLink);
                });

            } catch (err) {
                console.warn("Shortening failed, falling back to long link", err);
                if (linkInput) {
                    linkInput.value = longLink;
                    linkInput.disabled = false;
                }
                requestAnimationFrame(() => {
                    generateQRCode(longLink);
                });
            } finally {
                if (copyBtn) {
                    copyBtn.disabled = false;
                    copyBtn.textContent = "Copy Link";
                }
            }
        });
    }

    // Wiring close buttons
    if (closeBtns) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                shareModal.close();
            });
        });
    }

    // Close on click outside
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.close();
            }
        });
    }

    if (copyBtn && linkInput) {
        copyBtn.addEventListener('click', () => {
            linkInput.select();
            navigator.clipboard.writeText(linkInput.value).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "Copied!";
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }
}

/**
 * Attempts to shorten a URL using the TinyURL API.
 * @param {string} longUrl 
 * @returns {Promise<string>} The shortened URL or the original if failed.
 */
async function shortenUrl(longUrl) {
    // Note: This often hits CORS issues in pure client-side apps. 
    // Using a simple fetch here as a best-effort attempt.
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (response.ok) {
            return await response.text();
        }
        throw new Error("TinyURL response not ok");
    } catch (e) {
        console.warn("URL Shortening failed (likely CORS), using long URL.", e);
        return longUrl;
    }
}

/**
 * Generates a shareable URL with note data encoded in query params.
 * @param {Object} note - The active note object.
 * @param {string} username - The username of the sharer.
 * @returns {string} - The full URL.
 */
function generateShareLink(note, username) {
    let baseUrl = window.location.origin + window.location.pathname;

    // Replace localhost or 127.0.0.1 with LAN IP for mobile sharing
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        const lanIp = '10.110.153.152'; // Detected LAN IP
        baseUrl = baseUrl.replace(/localhost|127\.0\.0\.1/, lanIp);
    }

    // Create a minimal object to share
    const shareData = {
        t: note.title,
        c: note.content,
        d: note.updatedAt || new Date().toISOString()
    };

    // Encode with compression to save space
    const jsonString = JSON.stringify(shareData);
    let encodedData;
    if (window.LZString) {
        encodedData = window.LZString.compressToEncodedURIComponent(jsonString);
    } else {
        console.warn("LZString is undefined, falling back to basic encoding");
        encodedData = encodeURIComponent(jsonString);
    }

    // Build URL with descriptive parameters
    const params = new URLSearchParams();
    if (username) params.set('user', username);
    params.set('title', note.title || 'Untitled');
    params.set('company', 'Global Notes Workspace');
    params.set('share_data', encodedData);
    params.set('compressed', 'true');

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a QR Code in the #qrcode-container element.
 * @param {string} text - The text/URL to encode.
 */
function generateQRCode(text) {
    const container = document.getElementById('qrcode-container');
    if (!container) {
        console.error("QR Container not found");
        return;
    }

    // Clear previous QR
    container.innerHTML = '';

    // Check if QRCode lib is loaded
    if (!window.QRCode) {
        console.error("QRCode library not loaded");
        container.innerHTML = 'QR Code library not loaded. Check network or cache.';
        return;
    }

    try {
        console.log("Creating new QRCode instance for", text);
        new window.QRCode(container, {
            text: text,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.M
        });
    } catch (e) {
        console.error("QR Generation Error:", e);
        container.innerText = "Error generating QR Code";
    }
}

/**
 * Checks the URL at startup for shared data.
 * If found, displays the shared note.
 */
export function checkSharedUrl() {
    const params = new URLSearchParams(window.location.search);
    const shareDataRaw = params.get('share_data');
    const isCompressed = params.get('compressed') === 'true';
    const sharedBy = params.get('user');

    if (shareDataRaw) {
        try {
            let jsonString;

            if (isCompressed && typeof LZString !== 'undefined') {
                jsonString = LZString.decompressFromEncodedURIComponent(shareDataRaw);
            } else {
                jsonString = decodeURIComponent(shareDataRaw);
            }

            if (!jsonString) throw new Error("Decompression failed");

            const shareData = JSON.parse(jsonString);

            displaySharedNote(shareData, sharedBy);

            // Clean URL so refresh doesn't stick in shared mode forever optionally
            // window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("Error parsing share data:", e);
            alert("Invalid or corrupted share link.");
        }
    }
}

/**
 * Displays the shared note.
 * Since the user wants to "access the notes data as a text",
 * we can either inject it into the editor or show a special "Read Only" view.
 * For now, let's replace the editor content directly and maybe hide the sidebar/edit controls
 * to indicate this is a "Shared View". Or better, just load it as a new "Shared Note" in memory.
 */
function displaySharedNote(data, sharedBy) {
    // We will assume this runs before the main app initialization or alongside it.
    // Ideally, we might want a "read-only" mode. 

    // Let's create a "Shared Note" temporary object
    const sharedNote = {
        id: 'shared-' + Date.now(),
        title: data.t || 'Untitled Shared Note',
        content: data.c || '',
        updatedAt: data.d,
        tags: []
    };

    const footerText = sharedBy
        ? `Shared by <strong>${sharedBy}</strong> via Global Notes Workspace`
        : `Shared via Global Notes Workspace`;

    // For this implementation, we will completely replace the body to show a clean "Shared View"
    // This ensures no app UI leaks through, meeting the user's request for "only text in a proper page"

    document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${sharedNote.title} - Shared Note</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #f9f9f9;
                }
                .shared-container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                h1 {
                    margin-top: 0;
                    font-size: 2em;
                    color: #1a1a1a;
                    border-bottom: 2px solid #eaeaea;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .content {
                    font-size: 1.1em;
                    white-space: pre-wrap; /* Preserve whitespace/newlines if plain text */
                }
                .content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
                .meta {
                    margin-top: 40px;
                    font-size: 0.85em;
                    color: #888;
                    border-top: 1px solid #eaeaea;
                    padding-top: 20px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="shared-container">
                <h1>${sharedNote.title}</h1>
                <div class="content">${sharedNote.content}</div>
                <div class="meta">
                    ${footerText}
                </div>
            </div>
        </body>
        </html>
    `;
}
