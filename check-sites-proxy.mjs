import { createRequire } from 'module';
import https from 'https';
import http from 'http';

const require = createRequire(import.meta.url);
const { HttpsProxyAgent } = require('./node_modules/https-proxy-agent/dist/index.js');
const { HttpProxyAgent }  = require('./node_modules/http-proxy-agent/dist/index.js');

const PROXY      = 'http://127.0.0.1:10808';
const TIMEOUT_MS = 15000;
const CONCURRENCY = 5;

const httpsAgent = new HttpsProxyAgent(PROXY);
const httpAgent  = new HttpProxyAgent(PROXY);

const FAILED_SITES = [
  // 超时（可能 GFW）
  { name: 'clipdrop',         url: 'https://clipdrop.co/relight',                        file: '媒体工具/图片工具' },
  { name: 'remotedesktop',    url: 'https://remotedesktop.google.com/support',            file: '媒体工具/视频工具' },
  { name: 'ffmpeg-online',    url: 'https://ffmpeg-online.vercel.app/',                   file: '媒体工具/视频工具' },
  { name: '动漫花园',          url: 'https://share.dmhy.org',                              file: '生活娱乐/ACG' },
  { name: 'wallhaven',        url: 'https://wallhaven.cc/',                               file: '生活娱乐/ACG' },
  { name: '风铃动漫',          url: 'https://www.aafun.cc/',                               file: '生活娱乐/ACG' },
  { name: 'E站弹幕网',         url: 'https://www.ezdmw.site/',                             file: '生活娱乐/ACG' },
  { name: 'anybt',            url: 'https://anybt.eth.limo/',                             file: '生活娱乐/影视剧' },
  { name: '网盘资源',          url: 'https://news.bqrdh.com/wp',                           file: '生活娱乐/影视剧' },
  { name: '火车太堵',          url: 'https://www.tdgo.shop/',                              file: '生活娱乐/影视剧' },
  { name: '4K影视',            url: 'https://www.4kvm.tv/',                                file: '生活娱乐/影视剧' },
  { name: '看片狂人',          url: 'https://kuangren.us/',                                file: '生活娱乐/影视剧' },
  { name: '爱壹帆',            url: 'https://www.iyf.lv/',                                 file: '生活娱乐/影视剧' },
  { name: '星空影视',          url: 'https://www.xkvvv.com/',                              file: '生活娱乐/影视剧' },
  { name: '修罗影视',          url: 'https://xlys.me/',                                    file: '生活娱乐/影视剧' },
  { name: '真狼影视',          url: 'https://www.zhenlang.cc/',                            file: '生活娱乐/影视剧' },
  { name: '耐看点播',          url: 'https://nkvod.me/',                                   file: '生活娱乐/影视剧' },
  { name: 'Pinterest',        url: 'https://www.pinterest.com/',                          file: '生活娱乐/摄影' },
  { name: 'Hacker News',      url: 'https://news.ycombinator.com/',                       file: '网络信息/专业' },
  { name: 'V2EX',             url: 'https://www.v2ex.com/',                               file: '网络信息/专业' },
  { name: 'LINUX DO',         url: 'https://linux.do/',                                   file: '网络信息/专业' },
  { name: 'onekey',           url: 'https://card.onekey.so/',                             file: '网络信息/交易购物' },
  { name: 'okx欧易',           url: 'https://www.okx.com/cn',                              file: '网络信息/交易购物' },
  { name: 'web.archive',      url: 'https://web.archive.org/',                            file: '网络信息/日常' },
  { name: 'TradingView(误标)', url: 'https://cn.tradingview.com/',                         file: '网络信息/金融' },
  { name: '搬瓦工',            url: 'https://bandwagonhost.com/services',                  file: '软件与云/云服务商' },
  { name: 'conoha',           url: 'https://www.conoha.jp/',                              file: '软件与云/云服务商' },
  { name: 'godaddy',          url: 'https://www.godaddy.com/',                            file: '软件与云/云服务商' },
  { name: 'ImageGlass',       url: 'https://imageglass.org/',                             file: '软件与云/系统软件' },
  { name: '在线显示器测试',     url: 'https://www.eizo.be/monitor-test/',                   file: '软件与云/系统软件' },
  { name: 'spacedesk',        url: 'https://www.spacedesk.net/',                          file: '软件与云/系统软件' },
  // fetch failed（也有可能是 GFW）
  { name: 'caption2text',     url: 'https://f-loat.github.io/caption2text/',              file: '媒体工具/文本工具' },
  { name: 'jsoncrack',        url: 'https://jsoncrack.com/',                              file: '媒体工具/文本工具' },
  { name: '鬼才琪露诺',         url: 'https://afdian.net/@AdventCirno',                    file: '生活娱乐/ACG' },
  { name: '磁力狐',            url: 'https://bt31.foxs.vip/',                              file: '生活娱乐/影视剧' },
  { name: 'boju',             url: 'https://www.boju.cc/',                                file: '生活娱乐/影视剧' },
  { name: '奈飞工厂',          url: 'https://www.netflixgc.com/',                          file: '生活娱乐/影视剧' },
  { name: 'FreeHD',           url: 'https://www.freehd1.vip/',                            file: '生活娱乐/影视剧' },
  { name: 'LIBVIO',           url: 'https://www.libvio.vip/',                             file: '生活娱乐/影视剧' },
  { name: 'Depay',            url: 'https://www.dupay.one/web-app/register-h5?invitCode=487304&lang=zh-cn', file: '网络信息/交易购物' },
  { name: 'nobepay',          url: 'https://www.nobepay.com/app/login',                   file: '网络信息/交易购物' },
  { name: '看财报',            url: 'https://www.kancaibao.com/index.asp',                 file: '网络信息/金融' },
  { name: 'browserscan',      url: 'https://www.browserscan.net/zh',                      file: '网络工具/信息搜索' },
  { name: '500px',            url: 'https://500px.com/',                                  file: '生活娱乐/摄影' },
  { name: '即刻盘(500)',        url: 'https://jikepan.xyz',                                 file: '生活娱乐/影视剧' },
  { name: '2ip(503)',          url: 'https://2ip.io/',                                     file: '网络工具/信息搜索' },
];

function requestViaProxy(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const agent = isHttps ? httpsAgent : httpAgent;
    const lib   = isHttps ? https : http;

    const timer = setTimeout(() => {
      resolve({ ok: false, status: null, reason: '超时' });
    }, TIMEOUT_MS);

    const req = lib.request(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0 (site-checker/1.0)' } }, (res) => {
      clearTimeout(timer);
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ ok: true, status: res.statusCode });
      } else {
        resolve({ ok: res.statusCode < 500, status: res.statusCode });
      }
      res.resume();
    });

    req.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, status: null, reason: err.message.split('\n')[0] });
    });

    req.end();
  });
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
  console.log(`通过代理 ${PROXY} 重新检测 ${FAILED_SITES.length} 个站点...\n`);

  const tasks = FAILED_SITES.map((site) => async () => {
    const result = await requestViaProxy(site.url);
    const icon = result.ok ? '✓' : '✗';
    const statusStr = result.status ? `HTTP ${result.status}` : (result.reason || '无响应');
    process.stdout.write(`${icon} [${site.name}] ${statusStr}\n`);
    return { site, result };
  });

  const allResults = await runConcurrent(tasks, CONCURRENCY);

  const recovered = allResults.filter((r) => r.result.ok);
  const stillDead = allResults.filter((r) => !r.result.ok);

  console.log('\n' + '='.repeat(60));
  console.log(`\n【代理可访问 → 只是被 GFW 封锁】共 ${recovered.length} 个：\n`);
  for (const { site, result } of recovered) {
    console.log(`  ✓ ${site.name}  (HTTP ${result.status})  ← ${site.file}`);
  }

  console.log(`\n【代理也访问不了 → 站点真的挂了】共 ${stillDead.length} 个：\n`);
  for (const { site, result } of stillDead) {
    const statusStr = result.status ? `HTTP ${result.status}` : (result.reason || '无响应');
    console.log(`  ✗ ${site.name}  (${statusStr})  ← ${site.file}`);
  }
}

main().catch(console.error);
