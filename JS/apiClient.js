// Define the base URL for the JSONPlaceholder API (free mock API for testing)
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

// Export async function to fetch sample notes from the API with optional limit parameter
export async function fetchSampleNotes(limit = 5) {
  // Begin try block to handle potential errors during API call
  try {
    // Send GET request to fetch posts endpoint, limiting results to specified number
    const response = await fetch(`${API_BASE_URL}/posts?_limit=${limit}`);
    
    // Check if the HTTP response status is not successful (e.g., 404, 500)
    if (!response.ok) {
      // Throw error with the specific HTTP status code for debugging
      throw new Error(`API responded with ${response.status}`);
    }
    
    // Parse the JSON response body into a JavaScript object/array
    const data = await response.json();
    
    // Validate that data is an array; return empty array if invalid
    return Array.isArray(data) ? data : [];
    
  // Catch any errors thrown during fetch or parsing
  } catch (err) {
    // Log error message and the error object to browser console
    console.error("Failed to fetch sample notes", err);
    // Return empty array as fallback when API call fails
    return [];
  }
}

// Export async function to fetch user profile data by userId from the API
export async function fetchUserProfile(userId = 1) {
  // Begin try block to handle potential errors during API call
  try {
    // Send GET request to fetch specific user profile by userId
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    
    // Check if the HTTP response status is not successful
    if (!response.ok) {
      // Throw error with the specific HTTP status code for debugging
      throw new Error(`API responded with ${response.status}`);
    }
    
    // Parse and return the JSON response body as user profile object
    return await response.json();
    
  // Catch any errors thrown during fetch or parsing
  } catch (err) {
    // Log error message and the error object to browser console
    console.error("Failed to fetch user profile", err);
    // Return null as fallback when API call fails
    return null;
  }
}


