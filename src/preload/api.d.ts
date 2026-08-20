// Shape of the bridge exposed by preload/index.ts on `window.api`. Kept inline
// (rather than importing the value module) so the renderer's strict type check
// does not pull preload runtime code into the web program.
declare global {
  interface Window {
    // Optional on purpose: the bridge only exists inside Electron. Renderer
    // code runs without it under vitest/jsdom (and any future browser mode),
    api?: {
      /** Formats CFEngine policy, rejecting with a message if it cannot. */
      formatPolicy: (source: string) => Promise<string>;
      shouldUseDarkColors: () => Promise<boolean>;
    };
  }
}

export {};
