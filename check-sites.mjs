import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { load } from "js-yaml";

const DATA_DIR = resolve("source/_data");
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_CONCURRENCY = 10;

function collectYmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectYmlFiles(full));
    } else if ([".yml", ".yaml"].includes(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function collectSites() {
  const sites = [];
  const parseErrors = [];
  for (const file of collectYmlFiles(DATA_DIR)) {
    if (file === join(DATA_DIR, "webstack.yml")) continue;

    const raw = readFileSync(file, "utf8");
    let entries;
    try {
      entries = load(raw);
    } catch (error) {
      parseErrors.push(`${relative(DATA_DIR, file)}: ${error.message}`);
      continue;
    }
    if (!Array.isArray(entries)) {
      parseErrors.push(`${relative(DATA_DIR, file)}: YAML 根节点不是数组`);
      continue;
    }
    for (const entry of entries) {
      if (entry && entry.url && typeof entry.url === "string") {
        if (entry.url.startsWith("/") || entry.url.startsWith("#")) continue;
        sites.push({
          name: entry.name || entry.url,
          url: entry.url,
          file: relative(DATA_DIR, file).split(sep).join("/"),
        });
      }
    }
  }
  return { sites, parseErrors };
}

function readOptions(args) {
  const options = {
    timeout: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
  };
  for (let index = 0; index < args.length; index += 1) {
    const [flag, inlineValue] = args[index].split("=", 2);
    if (!["--timeout", "--concurrency"].includes(flag)) {
      throw new Error(`未知参数：${args[index]}`);
    }
    const value = inlineValue ?? args[++index];
    const parsed = Number.parseInt(value, 10);
    if (!value || !Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${flag} 必须是正整数`);
    }
    options[flag.slice(2)] = parsed;
  }
  return options;
}

async function checkUrl(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (site-checker/1.0)" },
    });
    let state = "failed";
    if (res.status >= 200 && res.status < 400) state = "available";
    if ([401, 403, 429].includes(res.status)) state = "restricted";
    return { state, status: res.status, finalUrl: res.url };
  } catch (err) {
    const reason =
      err.name === "AbortError" ? "超时" : err.message.split("\n")[0];
    return { state: "failed", status: null, reason, finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

async function runConcurrent(tasks, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  const { timeout, concurrency } = readOptions(process.argv.slice(2));
  const { sites, parseErrors } = collectSites();
  if (parseErrors.length > 0) {
    console.error(`数据解析失败，共 ${parseErrors.length} 个错误：`);
    parseErrors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `共检测 ${sites.length} 个站点，并发 ${concurrency}，超时 ${timeout}ms\n`,
  );

  const tasks = sites.map((site) => async () => {
    const result = await checkUrl(site.url, timeout);
    const icon =
      result.state === "available"
        ? "✓"
        : result.state === "restricted"
          ? "!"
          : "✗";
    const statusStr = result.status
      ? `HTTP ${result.status}`
      : result.reason || "无响应";
    const label =
      result.state === "restricted"
        ? "受限"
        : result.state === "failed"
          ? "失败"
          : "可用";
    process.stdout.write(
      `${icon} [${site.name}] ${label} ${statusStr} → ${result.finalUrl}\n`,
    );
    return { site, result };
  });

  const allResults = await runConcurrent(tasks, concurrency);
  const failed = allResults.filter((item) => item.result.state === "failed");
  const restricted = allResults.filter(
    (item) => item.result.state === "restricted",
  );

  console.log("\n" + "=".repeat(60));
  console.log(
    `可用 ${allResults.length - failed.length - restricted.length}，受限 ${restricted.length}，失败 ${failed.length}`,
  );
  if (restricted.length > 0) {
    console.log("\n受限站点（不视为明确死链）：");
    for (const { site, result } of restricted) {
      console.log(
        `  ! ${site.name} (HTTP ${result.status}) → ${result.finalUrl}`,
      );
    }
  }
  if (failed.length > 0) {
    console.log("\n明确失败：");
    for (const { site, result } of failed) {
      const statusStr = result.status
        ? `HTTP ${result.status}`
        : result.reason || "无响应";
      console.log(`  × ${site.name}`);
      console.log(`    原始  : ${site.url}`);
      console.log(`    最终  : ${result.finalUrl}`);
      console.log(`    原因  : ${statusStr}`);
      console.log(`    来源  : ${site.file}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
