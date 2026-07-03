# Playwright visual runner performance

In this WSL environment, unused loopback ports such as `127.0.0.1:4324` time out instead of immediately returning `ECONNREFUSED`. Playwright's `webServer.url` availability check performs an HTTP GET before starting the configured server and does not set a short socket timeout, causing `npm run test:visual` to spend ~2m35s before tests start.

Mitigation implemented: `npm run test:visual` runs `scripts/run-playwright-visual.mjs`, which starts Astro dev server on `127.0.0.1:4324`, waits for Astro readiness and a short-timeout HTTP 200, then runs Playwright with `PLAYWRIGHT_EXTERNAL_WEB_SERVER=1`. `playwright.config.ts` skips `webServer` when that env var is set.

Observed after change: `/usr/bin/time -v npm run test:visual -- --reporter=line` completed in ~13.9s, with Playwright reporting `14 passed (4.8s)`.
