import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { load } from 'js-yaml';

const DATA_DIR = './source/_data';
const TIMEOUT_MS = 10000;
const CONCURRENCY = 10;

// 递归收集所有 yml 文件
function collectYmlFiles(dir) {
  const results = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      results.push(...collectYmlFiles(full));
    } else if (extname(name) === '.yml') {
      results.push(full);
    }
  }
  return results;
}

// 从所有 yml 中提取站点条目
function collectSites() {
  const sites = [];
  for (const file of collectYmlFiles(DATA_DIR)) {
    const raw = readFileSync(file, 'utf8');
    let entries;
    try {
      entries = load(raw);
    } catch {
      continue;
    }
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (entry && entry.url && typeof entry.url === 'string') {
        // 跳过本地相对路径
        if (entry.url.startsWith('/') || entry.url.startsWith('#')) continue;
        sites.push({
          name: entry.name || entry.url,
          url: entry.url,
          file: file.replace(/\\/g, '/').replace('./source/_data/', ''),
        });
      }
    }
  }
  return sites;
}

// 检测单个 URL
async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (site-checker/1.0)' },
    });
    clearTimeout(timer);
    return { ok: res.status < 500, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    const reason = err.name === 'AbortError' ? '超时' : err.message.split('\n')[0];
    return { ok: false, status: null, reason };
  }
}

// 并发控制
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
  const sites = collectSites();
  console.log(`共检测 ${sites.length} 个站点，并发 ${CONCURRENCY}，超时 ${TIMEOUT_MS / 1000}s\n`);

  const tasks = sites.map((site) => async () => {
    const result = await checkUrl(site.url);
    const icon = result.ok ? '✓' : '✗';
    const statusStr = result.status ? `HTTP ${result.status}` : (result.reason || '无响应');
    process.stdout.write(`${icon} [${site.name}] ${statusStr}\n`);
    return { site, result };
  });

  const allResults = await runConcurrent(tasks, CONCURRENCY);

  const failed = allResults.filter((r) => !r.result.ok);

  console.log('\n' + '='.repeat(60));
  if (failed.length === 0) {
    console.log('所有站点均可访问！');
  } else {
    console.log(`共 ${failed.length} 个站点不可访问：\n`);
    for (const { site, result } of failed) {
      const statusStr = result.status ? `HTTP ${result.status}` : (result.reason || '无响应');
      console.log(`  × ${site.name}`);
      console.log(`    URL   : ${site.url}`);
      console.log(`    原因  : ${statusStr}`);
      console.log(`    来源  : ${site.file}`);
      console.log();
    }
  }
}

main().catch(console.error);
