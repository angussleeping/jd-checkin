# 京东签到 / 日常任务脚本库

青龙面板、呆呆面板均可使用。仓库从 [shufflewzc/faker2](https://github.com/shufflewzc/faker2)、faker4 中挑选适合静默运行的京东任务，已适配 Spy 插件 24 小时监控。

> 所有任务脚本均为上游混淆代码，本仓库的维护集中在 **Cookie 加载、青龙 API、通知、依赖安装** 等基础设施层。

---

## 最近更新

**2026-11-23 审计优化（本轮）**

- 修复 `sendNotify.js` 别名替换：别名含 `(` `[` `*` 等字符时正则构造抛错、含 `$&` 时替换结果被篡改
- 修复 `sendNotify.js` 缓存写入竞态：异步 `writeFile` 可能在脚本退出前来不及写盘，改为同步写入
- 修复 `jdCookie.js` 日志泄漏：CK 格式错误的提示会打印完整 `pt_key`，现改为 `pt_key=***`
- 修复 `ql.js`：移除无用的 `dotenv` 依赖（缺少该包的面板会导致所有通知崩溃）；接口返回异常时抛出可读错误
- 重写 `jd_indeps.sh`：依赖探测改为解析 `pnpm list --json`（原 `--parseable` 解析会误判、每次全量重装）；修正 `AUTOCFG` 硬编码成 faker4 的问题与 `set -u` 下的未定义变量；补充 `got@11`、`dotenv`；`sharp` 升级到 0.33.5（兼容 Node 20+）；pip 源换成清华源且失败不再中断
- `jd_gitfix.sh`：修正 `echo "...\n"` 不换行的问题
- 新增 `.gitattributes`（强制 `.sh` 使用 LF，避免 Windows 提交后面板报 `$'\r'` 语法错误）、`.gitignore`
- 删除无任何引用的 `function/accounts_proxy.json`

**2026-10-25 审计优化（上一轮）**：修复 `await exec()` 假等待、适配缓存损坏、`ql.js` 重写、依赖批量安装、仓库瘦身约 2MB。详细记录见 [CHANGELOG.md](CHANGELOG.md)。

---

## 快速开始（青龙面板）

### 1. 关闭或配置 Git 代理

打开青龙面板 → 配置文件，把 `GithubProxyUrl` 双引号中的内容清空（或填入你自己的代理地址），否则可能出现拉库失败。

### 2. 拉库

```text
ql repo https://gh-proxy.com/https://github.com/angussleeping/jd-checkin.git "jd_|jx_|gua_|jddj_|jdCookie" "activity|backUp" "^jd[^_]|USER|function|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate|ql|JDSignValidator|magic|depend|h5sts" "main"
```

| 参数 | 值 |
|------|-----|
| 仓库名 | `https://gh-proxy.com/https://github.com/angussleeping/jd-checkin.git` |
| 白名单 | `jd_\|jx_\|gua_\|jddj_\|jdCookie` |
| 黑名单 | `activity\|backUp` |
| 依赖规则 | `^jd[^_]\|USER\|function\|utils\|sendNotify\|ZooFaker_Necklace.js\|JDJRValidator_\|sign_graphics_validate\|ql\|JDSignValidator\|magic\|depend\|h5sts` |
| 分支 | `main` |

### 3. 安装依赖（必做一次）

拉库完成后，在青龙「定时任务」里手动运行一次 `jd_indeps.sh`（依赖安装），或在 SSH 中执行：

```bash
bash /ql/data/scripts/jd_indeps.sh    # 新版青龙
# 旧版青龙：bash /ql/scripts/jd_indeps.sh
```

脚本会批量安装 `got@11`、`tough-cookie`、`crypto-js`、`jsdom`、`sharp`、`big-integer` 等依赖。建议保留每周一次的定时（默认 `0 4 * * 1`），换机或升级面板后重新运行。

### 4. 添加京东 Cookie

青龙「环境变量」新增：

| 名称 | 值 |
|------|-----|
| `JD_COOKIE` | `pt_key=AAA;pt_pin=BBB;`（多个账号用 `&` 或换行分隔，分号不可省略） |

获取方式：浏览器登录 [京东商城](https://m.jd.com)，开发者工具 → Application → Cookies → `https://api.m.jd.com`，复制 `pt_key` 与 `pt_pin` 拼成上面的格式。

> 不要把 CK 写进 `jdCookie.js` 后提交到 GitHub。CK 等同于账号密码，仓库已对日志中的 `pt_key` 打码。

### 5. 配置通知（可选）

通知变量统一带组别后缀：**第 1 组不带后缀**，第 2 组起为 `变量名2`、`变量名3`……（用于按关键字分流推送）。

| 渠道 | 环境变量 |
|------|----------|
| Server 酱 | `PUSH_KEY` |
| PushPlus | `PUSH_PLUS_TOKEN`、`PUSH_PLUS_USER`（一对多群组编码） |
| Bark | `BARK_PUSH`、`BARK_SOUND`、`BARK_GROUP` |
| Telegram | `TG_BOT_TOKEN`、`TG_USER_ID`、`TG_API_HOST` |
| 钉钉机器人 | `DD_BOT_TOKEN`、`DD_BOT_SECRET` |
| 企业微信机器人 | `QYWX_KEY` |
| 企业微信应用 | `QYWX_AM`（`corpid,corpsecret,touser,agentid,消息类型`） |
| iGot | `IGOT_PUSH_KEY` |
| go-cqhttp | `GOBOT_URL`、`GOBOT_TOKEN`、`GOBOT_QQ` |
| Gotify | `GOTIFY_URL`、`GOTIFY_TOKEN`、`GOTIFY_PRIORITY` |
| WxPusher | `WP_APP_TOKEN`、`WP_UIDS`、`WP_TOPICIDS`、`WP_APP_TOKEN_ONE` |

其他通知开关：

| 变量 | 说明 |
|------|------|
| `NOTIFY_SHOWNAMETYPE` | `1` 原样 / `2` 别名(备注) / `3` 京东账号(备注) / `4` 仅备注 |
| `NOTIFY_AUTOCHECKCK` | `true` 时捕获“CK 失效”通知并自动检测、禁用失效账号 |
| `NOTIFY_CKTASK` | 配合上一项，CK 失效时触发的任务名，如 `jd_CheckCK` |
| `NOTIFY_NOCKFALSE` | `true` 时 CK 全部失效也不推送 |
| `NOTIFY_NOLOGINSUCCESS` | `true` 时未登录成功的账号不推送 |
| `NOTIFY_SKIP_TEXT` | 正文包含这些关键字时跳过推送（`&` 分隔） |
| `NOTIFY_SKIP_LIST` | 按通知标题跳过推送（`&` 分隔） |
| `NOTIFY_FILTERBYFILE` | 指定文件名关键字不推送（`&` 分隔） |
| `NOTIFY_NOREMIND` | 提醒类消息不推送（`&` 分隔） |

> 通知依赖 `sendNotify.js`。拉库会覆盖该文件，如果你自定义过内容，请改用 `AUTOCFG=true` + `deps` 目录方案，或每次拉库后重新配置。

---

## 呆呆面板

呆呆面板与青龙同源，直接使用上面的 `ql repo` 拉库命令与 `JD_COOKIE` 变量即可。

若面板版本不支持 `ql repo`，可手动操作：

```bash
cd /ql/data/scripts    # 旧版为 /ql/scripts
git clone -b main https://gh-proxy.com/https://github.com/angussleeping/jd-checkin.git
bash jd-checkin/jd_indeps.sh
```

然后在面板中把 `jd-checkin/jd_*.js` 依次添加为定时任务，脚本头部的 `cron:` 注释即默认执行时间。

---

## 任务清单

| 脚本 | 功能 | 默认 cron | 额外依赖 |
|------|------|-----------|----------|
| `jd_AutoEval.js` | 带图评价晒单 | `12 15 * * *` | `sharp`、`https-proxy-agent` |
| `jd_bean_change.js` | 京东资产统计 | `14 21 * * *` | `moment`、`big-integer`、`crypto-js` |
| `jd_bean_home.js` | 升级赚京豆 | `7 9 * * *` | `tough-cookie` |
| `jd_deliverySign.js` | 天天领豆（另一入口） | `19 6,18 * * *` | `tough-cookie` |
| `jd_hssign.js` | hs 每日签到 | `56 18 * * *` | `big-integer` |
| `jd_OnceApply.js` | 一键价保 | `32 16 * * *` | `jsdom` |
| `jd_qy_sign.js` | 权益中心签到 | `22 14 * * *` | `big-integer` |
| `jd_signbeanact.js` | 天天领豆（APP 首页领京豆） | `2 3,15 * * *` | `tough-cookie` |
| `jd_ttgd.js` | 天天刮京豆 | `21 8,20 * * *` | `big-integer`、`tough-cookie` |
| `jd_xsjx.js` | 限时京喜 | `38 7,19 * * *` | `tough-cookie` |
| `jd_yssign.js` | ys 每日签到 | `8 12 * * *` | `tough-cookie` |
| `jd_zjindan.js` | 天天砸金蛋 | `10 9,21 * * *` | `tough-cookie` |

> `jd_deliverySign.js` 与 `jd_signbeanact.js` 名称都含“天天领豆”，但入口不同。若面板日志中其中一个始终提示“已签到/活动不存在”，可停用该任务，不影响另一个。

---

## 目录结构

```text
.
├── jd_*.js                 # 12 个京东任务脚本（上游混淆代码，不建议改）
├── jdCookie.js             # 读取 JD_COOKIE、注入互助码环境变量、代理池开关
├── ql.js                   # 青龙 OpenAPI 封装（token 缓存、5600/5700 自动回退）
├── sendNotify.js           # 多渠道推送（ccwav 20230712 版）
├── USER_AGENTS.js          # 京东 App UA 池
├── jd_indeps.sh            # 依赖安装（建议每周一次）
├── jd_gitfix.sh            # 拉库网络修复（可选，运行一次即可）
├── function/               # 公共混淆库；sendNotify/ql/jdCookie 为根目录版本的转发 stub
├── utils/                  # Rebels 系列公共库
├── CHANGELOG.md            # 审计与变更记录
└── README.md
```

## 可选进阶变量

| 变量 | 说明 |
|------|------|
| `AUTOCFG=true` | 运行 `jd_indeps.sh` 时自动把 `sendNotify.js` 复制到 `deps` 目录 |
| `DP_POOL` | 代理池地址，需先安装 `global-agent`；配合 `PERMIT_JS` 只对指定脚本生效 |
| `PERMIT_JS` | 允许走代理池的脚本文件名，`&` 分隔 |
| `JD_USER_AGENT` | 覆盖默认 UA |
| `JD_DEBUG=false` | 关闭 `jdCookie.js` 的调试输出 |
| `ShareCodeConfigName` / `ShareCodeEnvName` | 配合 `task_before.sh` 注入互助码，一般无需手动设置 |

---

## 常见问题

**1. 提示“京东 cookie 填写不规范”？**
CK 必须同时包含 `pt_key=` 和 `pt_pin=`，并以分号结尾，例如 `pt_key=xxx;pt_pin=xxx;`。多账号用 `&` 或换行分隔，不要用中文分号。

**2. 报 `Cannot find module 'got'` / `sharp` / `jsdom`？**
依赖未装全。手动运行一次 `jd_indeps.sh`，确认日志末尾没有报错。`got` 必须为 11.x：12.x 起是纯 ESM，脚本里的 `require('got')` 会直接失败。

**3. 通知收不到？**
先确认变量名正确（第 1 组无后缀），再确认 `deps` 或 `scripts` 下存在 `sendNotify.js`，且拉库后没有被覆盖；最后看任务日志是否出现“开始发送通知”。Telegram 还需要服务器能访问 `api.telegram.org`。

**4. 拉库失败 / 拉取超时？**
运行一次 `jd_gitfix.sh`（仅对 `gh-proxy.com` 关闭 SSL 校验并增大缓冲区），或改用可用的 GitHub 代理后重试。

**5. CK 失效了怎么办？**
重新抓取 CK 覆盖环境变量。可以开启 `NOTIFY_AUTOCHECKCK=true` + `NOTIFY_CKTASK=jd_CheckCK`，让脚本在收到失效通知时自动检测并禁用失效账号，避免每天重复失败。

**6. 为什么不能在 GitHub Actions 里跑？**
`jdCookie.js` 检测到 `GITHUB_ACTIONS=true` 会主动退出并推送提醒。滥用公共 CI 资源会导致仓库和账号被封。

**7. 更新后自定义的通知配置丢了？**
`ql repo` 会覆盖 `scripts` 下的文件。把自定义 `sendNotify.js` 放到 `deps` 目录，并设置 `AUTOCFG=true` 重新执行依赖脚本。

**8. 任务脚本能改吗？**
任务脚本是上游混淆代码，改动容易导致签名/加密逻辑失效。本仓库只维护基础设施层；任务失效时优先等待上游更新或更换脚本。

---

## 安全说明

- `JD_COOKIE` 等同于账号密码（可下单、可查个人信息），只存放在面板环境变量中，不要写入代码、日志、截图或公开仓库。
- 本仓库已在 Cookie 格式告警中对 `pt_key` 打码。
- 任务脚本包含第三方混淆代码，仅建议在你自己可控的服务器/容器中运行；不建议多人共用同一容器。
- 建议给青龙面板设置强密码、关闭公网直接访问，并定期更换 CK。

---

## 特别声明

- 本仓库发布的脚本项目中涉及的任何解锁和解密分析脚本，仅用于测试、学习和研究，严禁用于商业用途。其合法性、准确性、完整性和有效性无法保证，请根据实际情况自行判断。
- 本项目中的所有资源文件，禁止任何官方账号或自媒体以任何形式复制或发布。
- 本仓库对任何脚本问题不承担责任，包括但不限于因脚本错误导致的损失或损坏。
- 任何用户若因间接使用该脚本（包括但不限于搭建 VPS 或传播该脚本）而违反国家/地区法律法规及相关规定，本仓库对此不承担任何隐私泄露或其他后果的责任。
- 请勿将脚本项目中的内容用于商业或非法目的，否则将承担相应责任。
- 如任何单位或个人认为本项目脚本可能侵犯其权利，应立即通知并提供身份及所有权证明。我们将在收到相关证明文件后删除该脚本。
- 任何人以任何形式直接或间接查看本项目中的任何脚本，均须仔细阅读本声明。本仓库保留随时修改或补充本免责声明的权利。一旦您使用或复制了本项目中的任何脚本或规则，即视为已接受本免责声明。

**您必须在下载后 24 小时内从您的电脑或手机中彻底删除上述内容。**

> 若您已在本仓库使用或复制了自行制作的任何脚本，则视为您已接受本声明，请务必仔细阅读。

---

## 特别感谢

- [@NobyDa](https://github.com/NobyDa)
- [@chavyleung](https://github.com/chavyleung)
- [@liuxiaoyucc](https://github.com/liuxiaoyucc)
- [@Zero-S1](https://github.com/Zero-S1)
- [@uniqueque](https://github.com/uniqueque)
- [@nzw9314](https://github.com/nzw9314)
- [@Andy Woo](https://t.me/update_help_group)「青龙互助研究院支持」
- [@Oreo](https://github.com/Oreomeow)「青龙 Faker 仓库一键安装配置」
- [@shufflewzc](https://github.com/shufflewzc)「faker2 和 faker4 原库」
