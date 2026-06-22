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

该命令会依次执行游戏数据检查、生产构建和 Workers 部署。线上 Worker 名称为 `heroes-live`。

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

- URL：`https://heroes-live.history-sim.workers.dev`
- Worker：`heroes-live`
- 中国大陆网络对 `workers.dev` 可能连接超时；正式对外试玩建议绑定已接入 Cloudflare 的自定义域名。
