import { BrowserWindow, app, ipcMain, nativeTheme, session, shell } from 'electron';
import type { WebFrameMain } from 'electron';
import { join } from 'path';

// electron-vite exposes the dev renderer URL via this env var; in a packaged
// app it is absent and we load the built HTML from disk instead.
const rendererDevUrl = process.env['ELECTRON_RENDERER_URL'];

// Only ever hand http(s) links to the OS: shell.openExternal with any other
// scheme (file:, smb:, custom protocols…) can execute programs.
function openExternalIfSafe(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
    shell.openExternal(url);
  }
}

// IPC handlers only answer our own renderer: the dev-server origin in dev,
// the bundled file: page in production.
function isTrustedFrame(frame: WebFrameMain | null): boolean {
  if (!frame || frame !== frame.top) return false;
  if (rendererDevUrl) return new URL(frame.url).origin === new URL(rendererDevUrl).origin;
  return frame.url === `file://${join(__dirname, '../renderer/index.html')}`;
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'CFEngine Policy Builder',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#21262A' : '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in the user's browser, never in-app.
  mainWindow.webContents.setWindowOpenHandler(details => {
    openExternalIfSafe(details.url);
    return { action: 'deny' };
  });

  // The app never navigates after load; anything else (dragged links, a
  // compromised renderer setting location.href) goes to the browser instead.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      openExternalIfSafe(url);
    }
  });

  if (rendererDevUrl) {
    mainWindow.loadURL(rendererDevUrl);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.northerntech.cfengine-policy-builder');

  // The app needs no web permissions (camera, geolocation, notifications…);
  // deny anything that asks.
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  ipcMain.handle('theme:should-use-dark', event => {
    if (!isTrustedFrame(event.senderFrame)) return false;
    return nativeTheme.shouldUseDarkColors;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
