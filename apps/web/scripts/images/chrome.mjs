// Render a local HTML file to PNG with headless Chrome over the DevTools protocol.
// No npm dependency: Node 22 ships `WebSocket` and `fetch`.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export function findChrome() {
  const found = CANDIDATES.find((p) => existsSync(p));
  if (!found)
    throw new Error(
      "No Chrome found. Install google-chrome or set CHROME_PATH to a Chrome/Chromium binary."
    );
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForPort(dir, child) {
  const file = join(dir, "DevToolsActivePort");
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error("Chrome exited at startup");
    if (existsSync(file)) {
      const [port] = readFileSync(file, "utf8").split("\n");
      if (port) return Number(port);
    }
    await sleep(100);
  }
  throw new Error("Chrome did not open the DevTools port in 10 s");
}

/**
 * Opens `htmlPath`, awaits `window.__ready` (a promise the page defines), and returns
 * `{ png: Buffer, result }` where `result` is the resolved value of `window.__ready`.
 * A rejected `__ready` (e.g. a font that failed to load) throws with the page's message.
 */
export async function renderPage(
  htmlPath,
  { width, height, timeoutMs = 60000 }
) {
  const dir = mkdtempSync(join(tmpdir(), "khoi-img-"));
  const child = spawn(
    findChrome(),
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--allow-file-access-from-files",
      "--disable-background-networking",
      "--no-first-run",
      "--remote-debugging-port=0",
      `--user-data-dir=${dir}`,
      `--window-size=${width},${height}`,
      "about:blank",
    ],
    { stdio: "ignore", detached: true }
  );
  const killGroup = () => {
    try {
      process.kill(-child.pid, "SIGKILL"); // Chrome's helper processes share the group
    } catch {
      child.kill("SIGKILL");
    }
  };
  const removeProfile = () => {
    try {
      rmSync(dir, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 150,
      });
    } catch {
      // a helper still held the profile; it is a temp dir, the OS clears it
    }
  };
  // Chrome runs in its own process group, so Ctrl-C would not reach it: clean up here.
  const onSignal = (signal) => {
    killGroup();
    removeProfile();
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  let ws;
  let timer;
  // Rejects when Chrome dies, the socket closes or the time budget runs out.
  const aborted = new Promise((_, reject) => {
    child.once("exit", () => reject(new Error("Chrome exited unexpectedly")));
    timer = setTimeout(
      () => reject(new Error(`render timed out after ${timeoutMs / 1000} s`)),
      timeoutMs
    );
  });
  aborted.catch(() => {});

  const run = async () => {
    const port = await waitForPort(dir, child);
    const targets = await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json();
    const page = targets.find((t) => t.type === "page");
    if (!page) throw new Error("Chrome has no page target");

    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = () => rej(new Error("DevTools WebSocket failed"));
    });
    let nextId = 0;
    const pending = new Map();
    const waiters = new Map();
    ws.onclose = () => {
      const err = new Error("DevTools connection closed");
      for (const { rej } of pending.values()) rej(err);
      pending.clear();
    };
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        if (m.error) rej(new Error(`${m.error.message}`));
        else res(m.result);
      } else if (m.method && waiters.has(m.method)) {
        waiters.get(m.method)();
        waiters.delete(m.method);
      }
    };
    const send = (method, params = {}) =>
      new Promise((res, rej) => {
        const id = ++nextId;
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });

    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const loaded = new Promise((res) =>
      waiters.set("Page.loadEventFired", res)
    );
    await send("Page.navigate", { url: pathToFileURL(htmlPath).href });
    await loaded;
    const evaluated = await send("Runtime.evaluate", {
      expression: "window.__ready",
      awaitPromise: true,
      returnByValue: true,
    });
    if (evaluated.exceptionDetails) {
      const d = evaluated.exceptionDetails;
      throw new Error(
        d.exception?.description?.split("\n")[0] ??
          d.text ??
          "page script failed"
      );
    }
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    return {
      png: Buffer.from(shot.data, "base64"),
      result: evaluated.result.value,
    };
  };

  try {
    const work = run();
    work.catch(() => {}); // a late failure after the race is settled is not an unhandled rejection
    return await Promise.race([work, aborted]);
  } finally {
    clearTimeout(timer);
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    const running = child.exitCode === null && child.signalCode === null;
    const exited = new Promise((res) => child.once("exit", res));
    try {
      ws?.close();
    } catch {
      // already closed
    }
    killGroup();
    if (running) await exited;
    await sleep(300);
    removeProfile();
  }
}
