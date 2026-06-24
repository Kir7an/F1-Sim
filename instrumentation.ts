export function register() {
  if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
    const store: Record<string, string> = {};
    Object.defineProperties(localStorage, {
      getItem:    { value: (k: string) => store[k] ?? null,            writable: true },
      setItem:    { value: (k: string, v: string) => { store[k] = v; }, writable: true },
      removeItem: { value: (k: string) => { delete store[k]; },        writable: true },
      clear:      { value: () => { Object.keys(store).forEach(k => delete store[k]); }, writable: true },
    });
  }
}
