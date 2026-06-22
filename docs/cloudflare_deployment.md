# Cloudflare 发布

当前 Web 游戏使用 Cloudflare Workers Static Assets 发布。构建产物位于 `exports/web`，Wrangler 配置位于 `web/wrangler.jsonc`。

## 首次登录

```bash
cd web
npm run cloudflare:login
```

浏览器授权后确认账号：

```bash
npm run cloudflare:whoami
```

## 正式发布

```bash
cd web
npm run deploy:cloudflare
```

该命令会依次执行游戏数据检查、生产构建、图片 WebP 优化、产物完整性检查和 Workers 部署。线上 Worker 名称为 `heroes-live`。

生产构建会自动将可压缩的 PNG 转换为 WebP，并验证图片引用、残留 PNG 和总体积上限。当前部署包约 6.7 MiB，相比优化前约 89 MiB，图片载荷减少约 92%。

只验证配置、不上传：

```bash
npm run deploy:check
```

## GitHub 自动发布

仓库已包含 `.github/workflows/deploy-cloudflare.yml`。在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

- `CLOUDFLARE_API_TOKEN`：具备 Workers Scripts Edit 权限的 API Token
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare Account ID

之后向 `main` 推送 `web/**`、`assets/**` 或部署工作流变更时，会自动运行游戏检查、构建并部署。也可以在 GitHub Actions 页面手动触发。

`wrangler.jsonc` 已配置 `single-page-application` 回退，直接访问或刷新应用路径不会返回 404。

如果两个 Secrets 尚未配置，工作流仍会完成检查和构建，并明确提示跳过部署，不会产生误导性的失败红叉。

## 自定义域名

正式部署完成后，在 Worker 的 Settings → Domains & Routes 中添加自己的域名。中国大陆网络对 `workers.dev` 可能连接不稳定，因此正式试玩建议使用自定义域名。

## 当前正式地址

- 推荐 URL：`https://heroes.20190628.xyz`
- Worker：`heroes-live`
- `workers.dev` 在部分中国大陆网络会出现 DNS 污染或连接超时，当前已关闭该入口，正式对外试玩统一使用自定义域名。
