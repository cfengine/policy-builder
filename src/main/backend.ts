import { spawn } from 'child_process';
import { app } from 'electron';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Runs the bundled Python sidecar (see `python/`): one short-lived process per
 * action, policy in on stdin, formatted policy out on stdout.
 */

const TIMEOUT_MS = 30_000;

const isWindows = process.platform === 'win32';
const executableName = isWindows ? 'cfpb-backend.exe' : 'cfpb-backend';

type SidecarResult = {
  code: number | null;
  signal: NodeJS.Signals | null;
  stderr: string;
  stdout: string;
};

/**
 * Packaged: the PyInstaller bundle in the app's resources. Development: that
 * bundle if built, else the uv virtualenv (`npm run backend:sync` suffices).
 */
function resolveCommand(): { command: string; commandArgs: string[] } {
  if (app.isPackaged) {
    return { command: join(process.resourcesPath, 'backend', executableName), commandArgs: [] };
  }

  // __dirname is out/main in development, so two levels up is the repo root.
  const repoRoot = join(__dirname, '../..');
  const bundled = join(repoRoot, 'python/dist/cfpb-backend', executableName);
  if (existsSync(bundled)) {
    return { command: bundled, commandArgs: [] };
  }

  const venvPython = join(repoRoot, 'python/.venv', isWindows ? 'Scripts/python.exe' : 'bin/python');
  return { command: venvPython, commandArgs: ['-m', 'cfpb_backend'] };
}

// Spawns the sidecar, feeds `input` on stdin, and resolves with the raw
// outcome; rejects only when the process cannot be spawned at all.
function runSidecar(input: string): Promise<SidecarResult> {
  const { command, commandArgs } = resolveCommand();
  if (!existsSync(command)) {
    return Promise.reject(new Error(`Python backend not found at ${command} — run \`npm run backend:build\` (or \`npm run backend:sync\` for development)`));
  }

  return new Promise<SidecarResult>((resolve, reject) => {
    // `timeout` SIGTERMs a hung child, surfacing as 'close' with that signal.
    // No guard flag: settling an already-settled promise is a no-op.
    const child = spawn(command, commandArgs, { windowsHide: true, timeout: TIMEOUT_MS });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    // A failed spawn (no execute permission, wrong architecture) arrives as an
    // event rather than a throw, so it has to become a rejection.
    child.on('error', error => reject(error));

    // Without a listener, EPIPE from a child that died before draining stdin
    // would crash the main process. 'close' still settles with the real cause.
    child.stdin.on('error', () => {});

    child.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }));

    child.stdin.end(input, 'utf8');
  });
}

// Maps a failed sidecar outcome to the message the UI shows the user.
function sidecarError(code: number | null, signal: NodeJS.Signals | null, stderr: string): Error {
  // SIGTERM only ever comes from the spawn timeout
  if (signal === 'SIGTERM') return new Error(`Process timed out after ${TIMEOUT_MS}ms`);
  if (signal) return new Error(stderr || `Process was killed by ${signal}`);
  return new Error(stderr || `Process failed (exit ${code})`);
}

/**
 * Formats CFEngine policy, resolving with the formatted text
 */
export async function formatPolicy(source: string): Promise<string> {
  const { code, signal, stdout, stderr } = await runSidecar(source);
  // Forward diagnostics so sidecar warnings show in the Electron console.
  if (stderr.trim()) console.error(`[cfpb-backend] ${stderr.trim()}`);
  if (code === 0) return stdout;
  throw sidecarError(code, signal, stderr.trim());
}
