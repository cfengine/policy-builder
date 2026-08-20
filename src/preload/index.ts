import { contextBridge, ipcRenderer } from 'electron';

// Everything the renderer can ask the main process to do goes through this
// typed bridge (see api.d.ts — the filename is load-bearing, see the note
// there). Keep it minimal and explicit.

// ipcRenderer.invoke wraps rejections as "Error invoking remote method 'x':
// Error: <message>". The renderer shows these messages to the user, so strip
// the plumbing prefix here rather than in every consumer.
function invoke<T>(channel: string, ...invokeArgs: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...invokeArgs).catch((cause: unknown) => {
    const message = cause instanceof Error ? cause.message : String(cause);
    throw new Error(message.replace(/^Error invoking remote method '[^']*': (?:\w*Error: )?/, ''));
  });
}

const api = {
  /** Returns whether the OS currently prefers a dark color scheme. */
  shouldUseDarkColors: (): Promise<boolean> => invoke('theme:should-use-dark'),

  /** Formats CFEngine policy text with the bundled `cfengine format` engine. */
  formatPolicy: (source: string): Promise<string> => invoke('policy:format', source)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // contextIsolation is enabled in this app, so this branch is a fallback only.
  window.api = api;
}
