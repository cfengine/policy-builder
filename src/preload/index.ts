import { contextBridge, ipcRenderer } from 'electron';

// Everything the renderer can ask the main process to do goes through this
// typed bridge (see index.d.ts). Keep it minimal and explicit.
const api = {
  /** Returns whether the OS currently prefers a dark color scheme. */
  shouldUseDarkColors: (): Promise<boolean> => ipcRenderer.invoke('theme:should-use-dark')
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // contextIsolation is enabled in this app, so this branch is a fallback only.
  // @ts-expect-error window is not typed on the isolated-world global here
  window.api = api;
}
