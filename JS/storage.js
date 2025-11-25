import { NOTES_STORAGE_PREFIX, ACTIVE_USER_KEY, ACCOUNT_KEY } from "./constants.js";

export function storageKeyForUser(user) {
  return `${NOTES_STORAGE_PREFIX}.${user || "guest"}`;
}

export function getNotes(user) {
  try {
    const raw = localStorage.getItem(storageKeyForUser(user));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setNotes(user, notes) {
  try {
    localStorage.setItem(storageKeyForUser(user), JSON.stringify(notes));
  } catch (err) {
    console.error("Failed to save notes", err);
  }
}

export function getActiveUser() {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY) || null;
  } catch {
    return null;
  }
}

export function setActiveUser(username) {
  if (!username) return;
  localStorage.setItem(ACTIVE_USER_KEY, username);
}

export function clearActiveUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

export function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setAccounts(accounts) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

export function migrateGuestNotesIfEmpty(username) {
  if (!username) return;
  const guestKey = storageKeyForUser(null);
  const userKey = storageKeyForUser(username);
  const guestData = localStorage.getItem(guestKey);
  if (!guestData) return;
  try {
    const existing = JSON.parse(localStorage.getItem(userKey) || "[]");
    if (Array.isArray(existing) && existing.length) {
      return;
    }
  } catch {
    // proceed with migration
  }
  localStorage.setItem(userKey, guestData);
}


