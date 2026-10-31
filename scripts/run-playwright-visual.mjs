#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { normalizeAstroOutput } from './astro-dev-output.mjs';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const host = '127.0.0.1';
const port = 4324;
const baseURL = `http://${host}:${port}/portfolio/`;
const pagefindURL = `${baseURL}pagefind/pagefind-component-ui.js`;
const isWindows = process.platform === 'win32';
const targetLocalURLPattern =
  /Local\s+http:\/\/127\.0\.0\.1:4324\/portfolio\/?(?:\s|$)/;
const anyLocalURLPattern =
  /Local\s+(http:\/\/127\.0\.0\.1:\d+\/portfolio\/?)(?:\s|$)/;

let serverOutput = '';
let buildProcess;
let previewServer;

function localBin(name) {
  const suffix = isWindows ? '.cmd' : '';
  return fileURLToPath(
    new URL(`../node_modules/.bin/${name}${suffix}`, import.meta.url)
  );
}

function appendServerOutput(data) {
  serverOutput += data.toString();
  if (serverOutput.length > 20_000) {
    serverOutput = serverOutput.slice(-20_000);
  }
}

function normalizeURL(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

function buildSite() {
  buildProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: rootDir,
    detached: !isWindows,
    env: process.env,
    shell: isWindows,
    stdio: 'inherit',
  });
  return waitForExit(buildProcess);
}

function startAstroPreviewServer() {
  const child = spawn(
    localBin('astro'),
    ['preview', '--ignore-lock', '--host', host, '--port', String(port)],
    {
      cwd: rootDir,
      detached: !isWindows,
      env: process.env,
      shell: isWindows,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  child.stdout.on('data', appendServerOutput);
  child.stderr.on('data', appendServerOutput);
  return child;
}

function waitForAstroReady(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error('Timed out waiting for Astro preview server readiness.')
      );
    }, 30_000);

    const cleanup = () => {
      clearTimeout(timeout);
      child.stdout.off('data', onData);
      child.stderr.off('data', onData);
      child.off('exit', onExit);
      child.off('error', onError);
    };

    const finish = () => {
      cleanup();
      resolve();
    };

    const fail = (error) => {
      cleanup();
      reject(error);
    };

    const onData = () => {
      const readableOutput = normalizeAstroOutput(serverOutput);
      if (targetLocalURLPattern.test(readableOutput)) {
        finish();
        return;
      }

      const localURLMatch = readableOutput.match(anyLocalURLPattern);
      if (localURLMatch) {
        const reportedURL = normalizeURL(localURLMatch[1]);
        fail(
          new Error(
            `Astro preview server started at ${reportedURL} instead of ${baseURL}. Is port ${port} already in use?`
          )
        );
      }
    };

    const onExit = (code, signal) => {
      fail(
        new Error(
          `Astro preview server exited before readiness. code=${code ?? 'null'} signal=${signal ?? 'null'}`
        )
      );
    };

    const onError = (error) => {
      fail(error);
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.once('exit', onExit);
    child.once('error', onError);
  });
}

function requestURL(url, timeoutMs) {
  return new Promise((resolve) => {
    const req = request(
      url,
      {
        headers: { Accept: '*/*' },
        timeout: timeoutMs,
      },
      (res) => {
        res.resume();
        resolve((res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 400);
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitForHTTP(url) {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if (await requestURL(url, 1_000)) {
      return;
    }
    await delay(100);
  }

  throw new Error(`Timed out waiting for ${url} to respond.`);
}

function runPlaywright(args) {
  const child = spawn(localBin('playwright'), ['test', ...args], {
    cwd: rootDir,
    env: {
      ...process.env,
      PLAYWRIGHT_EXTERNAL_WEB_SERVER: '1',
    },
    shell: isWindows,
    stdio: 'inherit',
  });
  return waitForExit(child);
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal === 'SIGINT') {
        resolve(130);
        return;
      }
      if (signal) {
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });
}

function killWindowsProcessTree(pid) {
  return new Promise((resolve, reject) => {
    const killer = spawn('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    });

    killer.once('error', reject);
    killer.once('exit', () => resolve());
  });
}

async function stopProcess(child) {
  if (!child?.pid || child.exitCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => child.once('exit', resolve));

  try {
    if (isWindows) {
      await killWindowsProcessTree(child.pid);
    } else {
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch (error) {
    if (error.code !== 'ESRCH') {
      throw error;
    }
  }

  await Promise.race([exited, delay(5_000)]);

  if (child.exitCode === null) {
    try {
      if (isWindows) {
        await killWindowsProcessTree(child.pid);
      } else {
        process.kill(-child.pid, 'SIGKILL');
      }
    } catch (error) {
      if (error.code !== 'ESRCH') {
        throw error;
      }
    }
  }
}

function printServerOutput() {
  if (serverOutput.trim()) {
    console.error('\nAstro preview server output:\n');
    console.error(serverOutput.trim());
  }
}

async function main() {
  try {
    if (process.env.PLAYWRIGHT_EXTERNAL_WEB_SERVER === '1') {
      if (
        !(await requestURL(baseURL, 1_000)) ||
        !(await requestURL(pagefindURL, 1_000))
      ) {
        throw new Error(
          `External preview at ${baseURL} must serve Pagefind assets. Run npm run build and start npm run preview first.`
        );
      }
      console.log(`Reusing external preview server at ${baseURL}`);
      const exitCode = await runPlaywright(process.argv.slice(2));
      process.exitCode = exitCode;
      return;
    }

    if (await requestURL(baseURL, 1_000)) {
      throw new Error(
        `Port ${port} is already in use. Stop that server, or explicitly supply a built preview with PLAYWRIGHT_EXTERNAL_WEB_SERVER=1.`
      );
    }

    const buildCode = await buildSite();
    if (buildCode !== 0) {
      process.exitCode = buildCode;
      return;
    }
    previewServer = startAstroPreviewServer();
    await waitForAstroReady(previewServer);
    await waitForHTTP(baseURL);
    await waitForHTTP(pagefindURL);
    console.log(`Astro preview server ready at ${baseURL}`);
    const exitCode = await runPlaywright(process.argv.slice(2));
    process.exitCode = exitCode;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    printServerOutput();
    process.exitCode = 1;
  } finally {
    await stopProcess(buildProcess);
    await stopProcess(previewServer);
  }
}

process.once('SIGINT', async () => {
  await stopProcess(buildProcess);
  await stopProcess(previewServer);
  process.exit(130);
});

process.once('SIGTERM', async () => {
  await stopProcess(buildProcess);
  await stopProcess(previewServer);
  process.exit(143);
});

await main();
