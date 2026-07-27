import type { AuthStorage } from "./types.js";

/** In-memory storage (Node.js default, tests). */
export class MemoryStorage implements AuthStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

/** Browser localStorage wrapper when available. */
export function createDefaultStorage(): AuthStorage {
  if (typeof globalThis !== "undefined") {
    const g = globalThis as { localStorage?: AuthStorage };
    if (g.localStorage && typeof g.localStorage.getItem === "function") {
      return g.localStorage;
    }
  }
  return new MemoryStorage();
}
