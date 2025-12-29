
// Flag to prevent multiple event listeners
let isWired = false;

export function wireMailFeature() {
    // Retry mechanism to ensure DOM elements are available
    function tryWireMailFeature(retries = 5, delay = 100) {
        // New Sidebar IDs
        const sendBtn = document.getElementById("sidebar-mail-send");
        const senderInput = document.getElementById("sidebar-mail-sender");
        const recipientInput = document.getElementById("sidebar-mail-recipient");
        const promptInput = document.getElementById("sidebar-mail-prompt");

        if (!sendBtn || !senderInput || !recipientInput || !promptInput) {
            if (retries > 0) {
                console.log(`Mail feature elements not found, retrying... (${retries} attempts left)`);
                setTimeout(() => tryWireMailFeature(retries - 1, delay), delay);
                return;
            } else {
                console.error('Mail feature elements not found after retries!');
                return;
            }
        }

        // Prevent duplicate wiring
        if (isWired) {
            console.log('Mail feature already wired, skipping...');
            return;
        }

        console.log('Mail feature wired successfully!');
        wireMailFeatureHandlers(sendBtn, senderInput, recipientInput, promptInput);
        isWired = true;
    }

    // Start trying to wire the feature
    tryWireMailFeature();
}

/**
 * Validates email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function wireMailFeatureHandlers(sendBtn, senderInput, recipientInput, promptInput) {
    // Generate and Open Mail
    sendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log('Mail button clicked!');
        const sender = senderInput.value.trim();
        const recipient = recipientInput.value.trim();
        const prompt = promptInput.value.trim();

        // Validation
        if (!sender) {
            alert("Please enter your email address.");
            senderInput.focus();
            return;
        }

        if (!isValidEmail(sender)) {
            alert("Please enter a valid email address for sender.");
            senderInput.focus();
            return;
        }

        if (!recipient) {
            alert("Please enter the recipient's email address.");
            recipientInput.focus();
            return;
        }

        if (!isValidEmail(recipient)) {
            alert("Please enter a valid email address for recipient.");
            recipientInput.focus();
            return;
        }

        if (!prompt) {
            alert("Please enter a prompt describing the mail you want to write.");
            promptInput.focus();
            return;
        }

        // Generate proper email from prompt
        let subject, body;
        try {
            const result = generateEmailFromPrompt(prompt, sender);
            subject = result.subject;
            body = result.body;
        } catch (error) {
            console.error('Error generating email:', error);
            alert('Error generating email. Please try again.');
            return;
        }

        // Some email clients have limits on mailto link length (around 2000-8000 chars)
        // Truncate body if needed, but keep it reasonable
        let finalBody = body;
        const maxBodyLength = 2000; // Conservative limit
        if (body.length > maxBodyLength) {
            finalBody = body.substring(0, maxBodyLength) + '\n\n[Email body truncated due to length limits]';
        }

        // Open Mail Client with generated email
        // Note: recipient should be URL encoded if it contains special characters
        // But typically email addresses don't need encoding in mailto:
        const encodedRecipient = recipient; // Keep as-is, mailto: handles standard emails
        const mailtoLink = `mailto:${encodedRecipient}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(finalBody)}`;

        console.log('Generated mailto link:', mailtoLink.substring(0, 100) + '...');
        console.log('Subject:', subject);
        console.log('Body length:', finalBody.length);

        // Open mail client
        try {
            // Create a temporary anchor element and click it (more reliable than location.href)
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.style.display = 'none';
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            
            // Remove link after a short delay
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
            }, 100);
            
            // Small delay before clearing to ensure mail client opens
            setTimeout(() => {
                // Clear inputs after opening mail client
                senderInput.value = "";
                recipientInput.value = "";
                promptInput.value = "";
            }, 200);
        } catch (e) {
            console.error('Error opening mailto link:', e);
            alert('Unable to open email client. Please check your email settings.');
        }
    });
}

/**
 * Converts a user prompt into a properly formatted email
 * @param {string} prompt - User's description of what they want to write
 * @param {string} sender - Sender's email/name
 * @returns {Object} Object containing subject and body
 */
function generateEmailFromPrompt(prompt, sender) {
    // Validate inputs
    if (!prompt || !sender) {
        throw new Error('Prompt and sender are required');
    }

    // Extract sender name from email if possible
    let senderName = sender;
    if (sender.includes('@')) {
        const emailPart = sender.split('@')[0];
        // Remove numbers and special chars, replace dots/underscores with spaces
        senderName = emailPart
            .replace(/[._-]/g, ' ')
            .replace(/\d+/g, '')
            .trim();
        
        // Capitalize first letter of each word
        if (senderName.length > 0) {
            senderName = senderName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
                .trim();
        }
        
        // Fallback if name extraction results in empty string
        if (!senderName || senderName.length === 0) {
            senderName = emailPart;
        }
    }

    // Generate subject line from prompt
    const subject = generateSubjectFromPrompt(prompt);

    // Generate professional email body
    const body = generateEmailBody(prompt, senderName);

    return { subject, body };
}

/**
 * Generates an appropriate subject line from the prompt
 */
function generateSubjectFromPrompt(prompt) {
    // Try to extract key information for subject
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for common email types
    if (lowerPrompt.includes('meeting') || lowerPrompt.includes('schedule')) {
        return extractSubject(prompt, 'Meeting Request');
    } else if (lowerPrompt.includes('follow up') || lowerPrompt.includes('follow-up')) {
        return extractSubject(prompt, 'Follow-up');
    } else if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
        return extractSubject(prompt, 'Thank You');
    } else if (lowerPrompt.includes('inquiry') || lowerPrompt.includes('question')) {
        return extractSubject(prompt, 'Inquiry');
    } else if (lowerPrompt.includes('proposal') || lowerPrompt.includes('suggest')) {
        return extractSubject(prompt, 'Proposal');
    } else if (lowerPrompt.includes('apolog') || lowerPrompt.includes('sorry')) {
        return extractSubject(prompt, 'Apology');
    } else {
        // Extract first meaningful sentence or phrase
        return extractSubject(prompt, 'Message');
    }
}

/**
 * Extracts a concise subject from prompt, with fallback
 */
function extractSubject(prompt, fallback) {
    if (!prompt || prompt.trim().length === 0) {
        return fallback;
    }

    // Try to get first sentence or first 50 characters
    const sentences = prompt.split(/[.!?]/);
    const firstSentence = sentences[0] ? sentences[0].trim() : '';
    
    if (firstSentence.length > 0 && firstSentence.length <= 60) {
        return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    } else if (prompt.length <= 60) {
        const trimmed = prompt.trim();
        return trimmed.length > 0 
            ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
            : fallback;
    } else {
        const truncated = prompt.substring(0, 50).trim();
        return truncated.length > 0 
            ? fallback + ': ' + truncated + '...'
            : fallback;
    }
}

/**
 * Generates a professional email body from the prompt
 */
function generateEmailBody(prompt, senderName) {
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    if (!senderName || senderName.trim().length === 0) {
        senderName = 'User';
    }

    // Analyze prompt to determine tone and structure
    const lowerPrompt = prompt.toLowerCase().trim();
    let greeting = 'Hello';
    let closing = 'Best regards';
    
    // Check if user already included a greeting
    const greetingPattern = /^(dear|hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\s+[^,\n]+/i;
    const hasGreeting = greetingPattern.test(prompt);
    
    // Adjust greeting based on context
    if (hasGreeting) {
        // Extract the greeting from prompt
        const greetingMatch = prompt.match(greetingPattern);
        if (greetingMatch) {
            greeting = greetingMatch[0].trim();
        }
    } else if (lowerPrompt.includes('formal') || lowerPrompt.includes('professional')) {
        greeting = 'Dear Sir/Madam';
        closing = 'Sincerely';
    }

    // Remove greeting from content if it exists to avoid duplication
    let emailContent = prompt.trim();
    if (hasGreeting) {
        // Remove the greeting line from content
        emailContent = prompt.replace(greetingPattern, '').trim();
        // Remove leading comma, colon, or whitespace
        emailContent = emailContent.replace(/^[,:\s]+/, '').trim();
    }
    
    // If content is empty after removing greeting, use original prompt
    if (!emailContent || emailContent.length === 0) {
        emailContent = prompt.trim();
    }
    
    // If prompt is very short or seems like a note, expand it
    if (emailContent.length < 50 && !emailContent.includes('.')) {
        emailContent = `I hope this message finds you well. ${emailContent}`;
    }

    // Structure the email body
    const body = `${greeting},

${emailContent}

${closing},
${senderName}

---
[Generated via Global Notes Workspace]`;

    return body;
}
