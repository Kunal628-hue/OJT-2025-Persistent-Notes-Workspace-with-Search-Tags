const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export async function fetchSampleNotes(limit = 5) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?_limit=${limit}`);
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch sample notes", err);
    return [];
  }
}

export async function fetchUserProfile(userId = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch user profile", err);
    return null;
  }
}


