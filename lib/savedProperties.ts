/** Client-only saved IDs. Production: replace with API (e.g. POST/GET /api/user/saved) + auth. */
const STORAGE_KEY = "fabhomes_saved_properties";

function getStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function setStorage(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getSavedPropertyIds(): string[] {
  return getStorage();
}

export function saveProperty(id: string): void {
  const ids = getStorage();
  if (ids.includes(id)) return;
  setStorage([...ids, id]);
}

export function removeSavedProperty(id: string): void {
  const ids = getStorage().filter((x) => x !== id);
  setStorage(ids);
}

export function isSaved(id: string): boolean {
  return getStorage().includes(id);
}
