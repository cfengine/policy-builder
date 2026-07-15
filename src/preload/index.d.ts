// Shape of the bridge exposed by preload/index.ts on `window.api`. Kept inline
// (rather than importing the value module) so the renderer's strict type check
// does not pull preload runtime code into the web program.
declare global {
  interface Window {
    api: {
      shouldUseDarkColors: () => Promise<boolean>;
    };
  }
}

export {};
