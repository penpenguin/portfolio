import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Child extends EventEmitter {
  pid: number;
  exitCode: number | null = null;
  stdout = new PassThrough();
  stderr = new PassThrough();

  constructor(pid: number) {
    super();
    this.pid = pid;
  }

  exit(code: number) {
    this.exitCode = code;
    this.emit('exit', code, null);
  }
}

let calls: { command: string; args: string[]; child: Child }[];
let requests: string[];
let serverReady: boolean;
let hasPagefind: boolean;
let buildCode: number;
let testCode: number;
let argv: string[];
let exitCode: typeof process.exitCode;
let signals: Map<NodeJS.Signals, ReturnType<typeof process.listeners>>;

beforeEach(() => {
  vi.resetModules();
  calls = [];
  requests = [];
  serverReady = false;
  hasPagefind = true;
  buildCode = 0;
  testCode = 0;
  argv = process.argv;
  exitCode = process.exitCode;
  signals = new Map(
    (['SIGINT', 'SIGTERM'] as const).map((signal) => [
      signal,
      process.listeners(signal),
    ])
  );
  process.argv = ['node', 'runner', 'tests/visual/wireframe-device.spec.ts'];
  vi.stubEnv('CI', '');
  vi.stubEnv('PLAYWRIGHT_EXTERNAL_WEB_SERVER', '');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'kill').mockImplementation((pid) => {
    calls.find((call) => call.child.pid === Math.abs(pid))?.child.exit(0);
    return true;
  });
  vi.doMock('node:timers/promises', () => ({
    setTimeout: () => Promise.resolve(),
  }));
  vi.doMock('node:child_process', () => ({
    spawn: (command: string, args: string[]) => {
      const child = new Child(100 + calls.length);
      calls.push({ command, args, child });
      queueMicrotask(() => {
        if (/(?:^|[/\\])astro(?:\.cmd)?$/.test(command)) {
          serverReady = true;
          child.stdout.write(
            JSON.stringify({
              message: 'Local    http://127.0.0.1:4324/portfolio/\n',
            }) + '\n'
          );
        } else if (command === 'taskkill') {
          calls
            .find((call) => call.child.pid === Number(args[1]))
            ?.child.exit(0);
          child.exit(0);
        } else
          child.exit(
            /(?:^|[/\\])playwright(?:\.cmd)?$/.test(command)
              ? testCode
              : buildCode
          );
      });
      return child;
    },
  }));
  vi.doMock('node:http', () => ({
    request: (
      url: string,
      _options: unknown,
      callback: (res: object) => void
    ) => {
      requests.push(String(url));
      return Object.assign(new EventEmitter(), {
        end: () =>
          queueMicrotask(() =>
            callback({
              statusCode:
                serverReady &&
                (!String(url).includes('/pagefind/') || hasPagefind)
                  ? 200
                  : 404,
              resume() {},
            })
          ),
        destroy() {},
      });
    },
  }));
});

afterEach(() => {
  for (const [signal, previous] of signals)
    for (const listener of process.listeners(signal))
      if (!previous.includes(listener)) process.off(signal, listener);
  process.argv = argv;
  process.exitCode = exitCode;
  vi.doUnmock('node:child_process');
  vi.doUnmock('node:http');
  vi.doUnmock('node:timers/promises');
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const run = () => import('../../../scripts/run-playwright-visual.mjs');

describe('visual runner startup', () => {
  it('builds Pagefind before preview and tests, propagates test failure and stops the preview', async () => {
    testCode = 7;
    await run();
    expect(
      calls
        .filter(({ command }) => command !== 'taskkill')
        .map(({ args }) => args[0])
    ).toEqual(['run', 'preview', 'test']);
    expect(calls[0].args).toEqual(['run', 'build']);
    expect(calls[2].args).toEqual([
      'test',
      'tests/visual/wireframe-device.spec.ts',
    ]);
    expect(process.exitCode).toBe(7);
    if (process.platform === 'win32')
      expect(
        calls.some(
          ({ command, args }) =>
            command === 'taskkill' && args[1] === String(calls[1].child.pid)
        )
      ).toBe(true);
    else
      expect(process.kill).toHaveBeenCalledWith(-calls[1].child.pid, 'SIGTERM');
  });

  it('does not start preview or tests when the build fails', async () => {
    buildCode = 2;
    await run();
    expect(calls.map(({ args }) => args)).toEqual([['run', 'build']]);
    expect(process.exitCode).toBe(2);
  });

  it('rejects an occupied port instead of silently testing an existing development server', async () => {
    serverReady = true;
    await run();
    expect(calls).toHaveLength(0);
    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('already in use')
    );
  });

  it('accepts an explicitly supplied preview only after checking Pagefind assets', async () => {
    vi.stubEnv('PLAYWRIGHT_EXTERNAL_WEB_SERVER', '1');
    serverReady = true;
    await run();
    expect(calls.map(({ args }) => args[0])).toEqual(['test']);
    expect(requests).toContain(
      'http://127.0.0.1:4324/portfolio/pagefind/pagefind-component-ui.js'
    );
    expect(process.kill).not.toHaveBeenCalled();
  });

  it('does not run tests against an explicit server without Pagefind', async () => {
    vi.stubEnv('PLAYWRIGHT_EXTERNAL_WEB_SERVER', '1');
    serverReady = true;
    hasPagefind = false;
    await run();
    expect(calls).toHaveLength(0);
    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Pagefind')
    );
  });
});
