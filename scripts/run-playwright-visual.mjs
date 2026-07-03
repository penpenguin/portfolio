#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const host = '127.0.0.1';
const port = 4324;
const baseURL = `http://${host}:${port}/portfolio/`;
const isWindows = process.platform === 'win32';

let serverOutput = '';
let devServer;

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

function startAstroDevServer() {
  const child = spawn(
    localBin('astro'),
    ['dev', '--host', host, '--port', String(port)],
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
      reject(new Error('Timed out waiting for Astro dev server readiness.'));
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

    const onData = () => {
      if (
        /Local\s+http:\/\/127\.0\.0\.1:4324\/portfolio\/?(?:\s|$)/.test(
          serverOutput
        )
      ) {
        finish();
      }
    };

    const onExit = (code, signal) => {
      cleanup();
      reject(
        new Error(
          `Astro dev server exited before readiness. code=${code ?? 'null'} signal=${signal ?? 'null'}`
        )
      );
    };

    const onError = (error) => {
      cleanup();
      reject(error);
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
  return new Promise((resolve, reject) => {
    const child = spawn(localBin('playwright'), ['test', ...args], {
      cwd: rootDir,
      env: {
        ...process.env,
        PLAYWRIGHT_EXTERNAL_WEB_SERVER: '1',
      },
      shell: isWindows,
      stdio: 'inherit',
    });

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

async function stopProcess(child) {
  if (!child?.pid || child.exitCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => child.once('exit', resolve));

  try {
    if (isWindows) {
      child.kill('SIGTERM');
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
        child.kill('SIGKILL');
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
    console.error('\nAstro dev server output:\n');
    console.error(serverOutput.trim());
  }
}

async function main() {
  devServer = startAstroDevServer();

  try {
    await waitForAstroReady(devServer);
    await waitForHTTP(baseURL);
    console.log(`Astro dev server ready at ${baseURL}`);
    const exitCode = await runPlaywright(process.argv.slice(2));
    process.exitCode = exitCode;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    printServerOutput();
    process.exitCode = 1;
  } finally {
    await stopProcess(devServer);
  }
}

process.once('SIGINT', async () => {
  await stopProcess(devServer);
  process.exit(130);
});

process.once('SIGTERM', async () => {
  await stopProcess(devServer);
  process.exit(143);
});

await main();
