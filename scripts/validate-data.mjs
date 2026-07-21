const { existsSync, readFileSync, readdirSync } =
  process.getBuiltinModule("node:fs");
const { extname, join, relative, resolve, sep } =
  process.getBuiltinModule("node:path");
const { createRequire } = process.getBuiltinModule("node:module");
const projectRequire = createRequire(
  join(process.cwd(), "scripts", "validate-data.mjs"),
);
const { load } = projectRequire("js-yaml");

const ROOT_DIR = resolve(process.cwd());
const DATA_DIR = join(ROOT_DIR, "source", "_data");
const THEME_SOURCE_DIR = join(ROOT_DIR, "themes", "webstack", "source");
const MENU_FILE = join(DATA_DIR, "webstack.yml");
const REQUIRED_FIELDS = ["name", "url", "img", "description", "tags"];
const REQUIRED_FIELD_SET = new Set(REQUIRED_FIELDS);

const errors = [];
const entries = [];
const dataConfigs = new Set();

function displayPath(path) {
  return relative(ROOT_DIR, path).split(sep).join("/");
}

function collectYamlFiles(directory) {
  const files = [];
  for (const dirent of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...collectYamlFiles(path));
    } else if ([".yml", ".yaml"].includes(extname(dirent.name).toLowerCase())) {
      files.push(path);
    }
  }
  return files;
}

function parseYaml(path) {
  try {
    return load(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${displayPath(path)}: YAML 解析失败：${error.message}`);
    return undefined;
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    const normalized = url.toString();
    return url.pathname === "/" && !url.search && !url.hash
      ? normalized.replace(/\/$/, "")
      : normalized;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function validateEntry(entry, path, index) {
  const location = `${displayPath(path)}[${index}]`;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    errors.push(`${location}: 条目必须是对象`);
    return;
  }

  const keys = Object.keys(entry);
  for (const field of REQUIRED_FIELDS) {
    if (!Object.hasOwn(entry, field)) {
      errors.push(`${location}: 缺少字段 "${field}"`);
    }
  }
  for (const field of keys) {
    if (!REQUIRED_FIELD_SET.has(field)) {
      errors.push(`${location}: 不允许字段 "${field}"`);
    }
  }

  for (const field of ["name", "url", "img", "description"]) {
    if (typeof entry[field] !== "string") {
      errors.push(`${location}.${field}: 必须是字符串`);
    }
  }
  for (const field of ["name", "url", "img", "description"]) {
    if (typeof entry[field] === "string" && entry[field].trim() === "") {
      errors.push(`${location}.${field}: 不得为空`);
    }
  }

  if (!Array.isArray(entry.tags)) {
    errors.push(`${location}.tags: 必须是数组`);
  } else {
    if (entry.tags.length < 3 || entry.tags.length > 6) {
      errors.push(`${location}.tags: 必须包含 3-6 个标签`);
    }
    const seenTags = new Set();
    entry.tags.forEach((tag, tagIndex) => {
      if (typeof tag !== "string" || tag.trim() === "") {
        errors.push(`${location}.tags[${tagIndex}]: 必须是非空字符串`);
        return;
      }
      if (tag !== tag.trim()) {
        errors.push(`${location}.tags[${tagIndex}]: 不得有首尾空格`);
      }
      if (tag === "在线") {
        errors.push(`${location}.tags[${tagIndex}]: 不允许精确标签 "在线"`);
      }
      if (seenTags.has(tag)) {
        errors.push(`${location}.tags: 同一条目中标签 "${tag}" 重复`);
      }
      seenTags.add(tag);
    });
  }

  if (typeof entry.img === "string" && entry.img.startsWith("/images/")) {
    const imagePath = join(THEME_SOURCE_DIR, ...entry.img.slice(1).split("/"));
    if (!existsSync(imagePath)) {
      errors.push(`${location}.img: 本地图片不存在：${entry.img}`);
    }
  }

  entries.push({ entry, location });
}

function main() {
  for (const path of collectYamlFiles(DATA_DIR)) {
    if (resolve(path) === resolve(MENU_FILE)) continue;

    const config = relative(DATA_DIR, path)
      .split(sep)
      .join("/")
      .replace(/\.(?:ya?ml)$/i, "");
    dataConfigs.add(config);

    const document = parseYaml(path);
    if (document === undefined) continue;
    if (!Array.isArray(document)) {
      errors.push(`${displayPath(path)}: YAML 根节点必须是数组`);
      continue;
    }
    document.forEach((entry, index) => validateEntry(entry, path, index));
  }

  const names = new Map();
  const urls = new Map();
  for (const { entry, location } of entries) {
    if (typeof entry.name === "string" && entry.name.trim()) {
      const key = entry.name.trim().toLocaleLowerCase();
      if (names.has(key)) {
        errors.push(
          `${location}.name: 与 ${names.get(key)} 重复：${entry.name}`,
        );
      } else {
        names.set(key, `${location}.name`);
      }
    }
    if (typeof entry.url === "string" && entry.url.trim()) {
      const key = normalizeUrl(entry.url.trim());
      if (urls.has(key)) {
        errors.push(`${location}.url: 与 ${urls.get(key)} 重复：${entry.url}`);
      } else {
        urls.set(key, `${location}.url`);
      }
    }
  }

  const menuDocument = parseYaml(MENU_FILE);
  const menuConfigs = new Set();
  if (
    !menuDocument ||
    typeof menuDocument !== "object" ||
    Array.isArray(menuDocument)
  ) {
    errors.push(`${displayPath(MENU_FILE)}: 菜单配置根节点必须是对象`);
  } else if (!Array.isArray(menuDocument.menu)) {
    errors.push(`${displayPath(MENU_FILE)}: menu 必须是数组`);
  } else {
    for (const group of menuDocument.menu) {
      if (!Array.isArray(group?.submenu)) continue;
      for (const item of group.submenu) {
        if (typeof item?.config === "string" && item.config.trim()) {
          if (menuConfigs.has(item.config)) {
            errors.push(
              `${displayPath(MENU_FILE)}: menu config 重复：${item.config}`,
            );
          }
          menuConfigs.add(item.config);
        }
      }
    }
  }

  for (const config of menuConfigs) {
    if (!dataConfigs.has(config)) {
      errors.push(
        `${displayPath(MENU_FILE)}: menu config 无对应 YAML：${config}`,
      );
    }
  }
  for (const config of dataConfigs) {
    if (!menuConfigs.has(config)) {
      errors.push(`${displayPath(MENU_FILE)}: YAML 未被 menu 引用：${config}`);
    }
  }

  if (errors.length > 0) {
    console.error(`数据校验失败，共 ${errors.length} 个错误：`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(
      `数据校验通过：${dataConfigs.size} 个分类文件，${entries.length} 条站点，${menuConfigs.size} 个菜单配置。`,
    );
  }
}

if (typeof hexo === "undefined") {
  main();
}
