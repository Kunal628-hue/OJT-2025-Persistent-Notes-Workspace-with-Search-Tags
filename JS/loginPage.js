// Import storage functions for account management and user session handling
import { getAccounts, setActiveUser, migrateGuestNotesIfEmpty } from "./storage.js";

// Export function to initialize the login form with customizable parameters
export function initLoginForm({
  formId = "login-form",           // Default form element ID to target
  setMessage = () => {},           // Callback function to display messages to user
  toggleView = () => {},           // Callback function to switch between login/signup views
} = {}) {
  // Retrieve the form element from the DOM using the provided formId
  const form = document.getElementById(formId);
  // Exit early if the form element doesn't exist in the HTML
  if (!form) return;

  // Attach a submit event listener to the form to handle login attempts
  form.addEventListener("submit", (e) => {
    // Prevent the default form submission behavior (page reload)
    e.preventDefault();
    
    // Get references to the username and password input fields
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    
    // Extract and trim the username value, default to empty string if not found
    const username = usernameInput?.value.trim() || "";
    // Extract the password value, default to empty string if not found
    const password = passwordInput?.value || "";

    // Retrieve all stored user accounts from local storage
    const accounts = getAccounts();
    
    // Search for an account matching the entered username (case-insensitive)
    const account = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
    
    // If no matching account is found, show error and redirect to signup
    if (!account) {
      setMessage("Account not found. Create one below.", "error");
      toggleView("signup");
      return;
    }
    
    // If account exists but password doesn't match, show error and stay on login
    if (account.password !== password) {
      setMessage("Incorrect password. Try again.", "error");
      return;
    }

    // Migrate guest notes to the user's account if their account notes are empty
    migrateGuestNotesIfEmpty(account.username);
    
    // Set the authenticated user as the active user in storage
    setActiveUser(account.username);
    
    // Show success message to the user
    setMessage("Success! Redirecting…", "success");
    
    // Wait 400ms then redirect to main application page
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 400);
  });
}


