import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia, which useColorScheme relies on.
// Default to light mode in tests.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList;
}
