# 导航站维护

## 构建前检查

使用 Node.js 20 或更高版本安装依赖，然后按以下顺序校验和构建：

```sh
npm ci
npm run validate
npm run clean
npm run build
```

`npm run verify` 会依次执行 `validate → clean → build`。

## 分类数据

菜单分类位于 `source/_data/<一级分类>/<二级分类>.yml`，并须与
`source/_data/webstack.yml` 的 `menu[].submenu[].config` 双向对应。每个文件的根节点为数组，
每条记录只能且必须包含以下字段：

```yaml
- name: 非空站点名
  url: https://example.com/
  img: /images/example.png
  description: 非空简介
  tags:
    - 标签一
    - 标签二
    - 标签三
```

`img` 必须是非空字符串；以 `/images/` 开头时，文件必须存在于
`themes/webstack/source/images/`。`tags` 必须有 3–6 个，不能重复、带首尾空格或使用精确标签
`在线`。校验还会拒绝额外字段、重复名称和规范化后重复的 URL。

## 链接检查

```sh
npm run check-links -- --timeout 10000 --concurrency 10
```

2xx/3xx 视为可用，401/403/429 标记为“受限”但不判定为死链；404/410/5xx 和网络错误会令命令失败。
每周 CI 仅生成检查日志，不阻断 Pages 部署。检查器不内置代理；需要代理复测时，请在已由系统代理、
VPN 或运行环境代理配置接管 Node.js 流量的环境中人工重跑上述命令。
