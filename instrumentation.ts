export async function register() {
  // Node 25 exposes a stub localStorage global that lacks getItem/setItem.
  // Polyfill it so Next.js dev overlay doesn't crash during SSR.
  if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
    const store: Record<string, string> = {};
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  }
}
