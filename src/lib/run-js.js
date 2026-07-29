function formatArg(arg) {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.stack || arg.message;
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

/**
 * Runs JavaScript in the browser and captures console output.
 * Only intended for the collaborative editor's JS run feature.
 */
export function runJavaScript(code) {
  const logs = [];
  const startedAt = performance.now();

  const push = (type, args) => {
    logs.push({
      type,
      text: args.map(formatArg).join(" "),
      time: Date.now(),
    });
  };

  const sandboxConsole = {
    log: (...args) => push("log", args),
    info: (...args) => push("info", args),
    warn: (...args) => push("warn", args),
    error: (...args) => push("error", args),
    debug: (...args) => push("debug", args),
    clear: () => {
      logs.length = 0;
    },
  };

  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function("console", `"use strict";\n${code}`);
    const result = runner(sandboxConsole);

    if (result !== undefined) {
      push("result", [result]);
    }

    return {
      ok: true,
      logs,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    push("error", [error]);
    return {
      ok: false,
      logs,
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
