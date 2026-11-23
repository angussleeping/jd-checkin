# 变更摘要（2026-11-23 第四轮：引入并优化 faker4 的 3 个 Python 工具脚本）

本轮把上游 [shufflewzc/faker4](https://github.com/shufflewzc/faker4) 里的三个纯 Python 工具引入到仓库，并做了针对性优化。和混淆的 JS 任务脚本不同，这些是可读源码，可以安全修改。

## 新增文件

| 文件 | 用途 | 依赖 |
|---|---|---|
| `jd_cookie_helper.py` | 本机扫码获取 JD_COOKIE，浏览器登录态缓存免重复扫码 | `playwright` |
| `jd_activity_scanner.py` | 扫描京东公开接口/活动页，生成存活报告（Markdown / JSON） | `requests` |
| `jd_daily.py` | 每日签到 + 赚京豆（纯 HTTP，不依赖 h5st 签名，面板/本地均可） | `requests` |

## 优化明细

### `jd_cookie_helper.py`（相对 faker4）

| 问题 | 修复 |
|---|---|
| 登录态缓存写 CWD，容易被 `git add .` 不小心提交 | 默认改 `~/.jd-cookie/state.json`（用户 home 目录） |
| `--headless` + 无缓存 → 白等 3 分钟才失败 | 提前检测并立即报错，提示"先用有头模式跑一次" |
| Ctrl+C 中断时浏览器进程残留（孤儿 chromium） | 加 KeyboardInterrupt 捕获，`with sync_playwright()` 自动退出 |
| Playwright chromium 未安装 → 默认报错信息不清楚 | 检测 `launch` 异常里的 "not installed"，给出 install 命令 + 国内镜像加速选项 |
| 终端输出完整 Cookie（`pt_key=...`），截图/日志泄漏风险 | 终端打印自动脱敏 `pt_key=***`；剪贴板和文件保留完整值 |
| 登录态文件权限所有人可读 | 非 Windows 上 `os.chmod(state_file, 0o600)` |
| Windows `clip` 命令需 UTF-16LE | 改用 `encode('utf-16le')`；Linux xclip 不存在时回退 wl-copy |

### `jd_activity_scanner.py`（相对 faker4）

| 问题 | 修复 |
|---|---|
| 模块级 `session_global`（全局变量） | 移入 `main()` 的闭包，与 ThreadPoolExecutor 同生命周期，`with requests.Session()` 自动关闭 |
| 活动排序依赖 `id(act)`（CPython 内存地址，不可移植） | 改用 `(name, category)` tuple 作稳定 key |
| 单个活动卡住 → 整体扫描无上限等待 | 每个活动探测 25s 硬超时 `fut.result(timeout=25)`，超时视为失败 |
| `timeout=15` 不区分连接/读取 | 改为 `timeout=(5, 15)`（连接 5s + 读取 15s） |
| 只有 Markdown 报告 | 新增 `--json` 输出（同路径 `.json` 后缀，方便程序化解析） |
| `notify()` 与青龙 `notify.py` 模块名容易混淆 | 本地函数改名 `emit()`，青龙模块显式 `ql_notify_send` |

### `jd_daily.py`（相对 faker4）

| 问题 | 修复 |
|---|---|
| `requests.Session()` 创建后永不关闭（账号循环里泄漏） | 改为 `with requests.Session() as s:` 上下文管理器 |
| `timeout=15` 不区分连接/读取 | 改为 `timeout=(5, 15)` |
| `sign()` 定义后从未被调用 | 保留为扩展点，docstring 说明"当前所有接口无需签名" |
| SQL f-string `FROM {tbl}` 理论上有注入风险 | 表格名是固定常量元组，注释说明安全原因 |
| `notify()` 与青龙 `notify.py` 模块名容易混淆 | 本地函数改名 `emit()` |

### `.gitignore`（新增条目）

```
__pycache__/
*.pyc
jd_auth_state.json
jd_cookie.txt
jd_activity_report.md
jd_activity_report.json
activity_report.md
activity_report.json
```

## README 同步更新

- 新增 `## Python 辅助工具` 章节，分别介绍三个脚本的用途、安装依赖、运行示例、相对 faker4 的优化点
- 目录结构树新增三个 `.py` 文件

## 验证

```bash
python -m py_compile jd_cookie_helper.py       # OK
python -m py_compile jd_activity_scanner.py    # OK
python -m py_compile jd_daily.py               # OK
python jd_activity_scanner.py --list           # 输出 11 项活动清单
python jd_daily.py                             # 无 JD_COOKIE 时输出友好提示
python jd_cookie_helper.py --headless          # 缺 playwright 时提示安装命令；如果已有 playwright 但无缓存会立即失败并报错
```

---

# 变更摘要（2026-11-23 第三轮：从 faker4 合并基础设施层）

### 1. `jdCookie.js` —— 代理池模式（来自 faker4）

新增 `DP_POOL` / `PERMIT_JS` 两个环境变量。设置后可让指定脚本的所有 HTTP 请求走代理池，规避京东的 IP 封禁：

```
DP_POOL=socks5://user:pass@proxy.host:1080     # 代理池地址（需先 pnpm i -g global-agent）
PERMIT_JS=jd_zjindan&jd_signbeanact&jd_bean_change   # 允许走代理的脚本，& 分隔；不设则所有脚本都不走
```

未设置 `DP_POOL` 时静默跳过，对现有脚本无任何影响。

### 2. `jdCookie.js` —— 互助码注入（来自 faker4）

新增 `ShareCodeConfigChineseName` / `ShareCodeConfigName` / `ShareCodeEnvName` 三个环境变量，由面板的 `task_before.sh` 在脚本启动前注入，用于把互助码日志（`$QL_DIR/data/log/.ShareCode/xxx.log`）里的 `${变量}` 占位符自动解析并拼成目标环境变量。这是青龙呆呆面板 ptask 并行任务配合农场/种豆互助时的基础设施，一般用户无需手动配置。

### 3. 保留了前一轮的 CK 日志打码 / GITHUB_ACTIONS 保护 / `dotenv` 删除

完整 diff 见 `jdCookie.js`。

---

# 变更摘要（2026-11-23 第二轮审计优化）

本轮只改动基础设施层（Cookie 加载 / 青龙 API / 通知 / 依赖脚本），未触碰任务脚本的混淆逻辑。

## 一、修复的 Bug（6 个）

| # | 文件 | 问题 | 修复方式 |
|---|------|------|---------|
| 1 | sendNotify.js:748 | 账号别名含 `(` `[` `*` 等正则元字符时，`new RegExp()` 抛错，别名替换整体失败（异常被 try/catch 吞掉，通知里仍显示 pin） | 新增 `escapeRegExp()` / `replaceByNames()`，替换值改用函数，避免 `$&`/`$1` 被当作占位符 |
| 2 | sendNotify.js:800 | 别名缓存用异步 `fs.writeFile`，脚本可能在写盘前退出，导致缓存丢失、每次重复请求京东接口 | 改为 `fs.writeFileSync` 并捕获异常 |
| 3 | jdCookie.js:33 | Cookie 格式不规范时把完整 `pt_key` 打印到日志，存在 CK 泄漏风险 | 新增 `maskCK()`，日志中显示为 `pt_key=***` |
| 4 | ql.js:4 | 无条件 `require('dotenv').config()`，但代码从未使用；缺少该依赖的面板（部分呆呆面板）会让所有通知崩溃 | 删除无用依赖 |
| 5 | ql.js:72 | 青龙接口返回非 200 或 data 非数组时，下游 `data.length` 抛 `TypeError`，难以定位 | 校验 `code === 200` 且 `data` 为数组，抛出可读错误 |
| 6 | jd_indeps.sh:84 | `pnpm list -g --parseable` 输出的是路径而非 `包名@版本`，`awk -F@` 解析失败 → 认为所有依赖未安装，每次全量重装 | 改用 `pnpm list -g --json` + node 解析 |

## 二、依赖与兼容性

- **新增 `got@11.8.6`**：`got` 被几乎所有脚本引用但原依赖清单缺失；且必须锁 11.x（12+ 为纯 ESM，`require('got')` 会失败）
- **新增 `dotenv@16.4.5`**：`jdCookie.js` 互助码解析需要
- **`sharp` 0.32.0 → 0.33.5**：0.32 对 Node 20+ 兼容性差，新版青龙默认 Node 20/22
- **`tunnel` 由 `latest` 改为 `0.0.6`**：避免每次运行都重装
- **pip 镜像由豆瓣源改为清华源**：豆瓣 pypi 已停止服务；同时 pip 失败不再中断整个脚本

## 三、脚本健壮性

- **jd_indeps.sh**
  - 修复 `AUTOCFG` 逻辑：原来硬编码 `shufflewzc_faker4` 仓库名，本仓库使用时必然找不到文件；现在按当前目录/自动查找定位 `sendNotify.js`
  - 修复 `set -u` 下 `dir_data` 未定义导致脚本直接退出
  - 增加 `pnpm` 存在性检查与清晰提示
  - 定时注释由每年一次（`0 8 5 5 *`）调整为每周一次（`0 4 * * 1`）
- **jd_gitfix.sh**：`echo "...\n"` 改为 `printf`，修复输出不换行

## 四、仓库规范

- 新增 `.gitattributes`：强制 `*.sh` 以 LF 存储，避免 Windows 提交 CRLF 后青龙报 `syntax error near unexpected token 'do\r'`
- 新增 `.gitignore`：忽略 `node_modules/`、`.env`、`*.log`
- 删除无任何引用的 `function/accounts_proxy.json`（没有代码读取该文件，容易让人误以为支持按账号配置代理）
- README 重写：补齐任务清单、依赖说明、环境变量、通知配置、呆呆面板用法、FAQ 与安全说明

## 五、验证情况

- 所有改动的 JS 通过 `node --check`
- `jd_indeps.sh`、`jd_gitfix.sh` 去除 CRLF 后通过 `bash -n`
- `jdCookie.js` 冒烟测试：正常 CK 导出 `CookieJD` 成功；非法 CK 日志输出 `pt_key=***`
- 依赖静态扫描覆盖 12 个任务脚本，未发现新增缺失的本地文件

## 遗留事项

- 任务脚本为上游混淆代码，内含若干不会执行的“诱饵” `require`（如 `@redacted/enterprise-plugin`），无法安全清理
- `USER_AGENTS.js` 为 2024 年指纹，如需可随上游更新 UA 池

---

# 变更摘要（2026-10-25 优化）

对应提交：`5f96674`（优化主体）、`484d54d`（清理备份目录）
仓库：https://github.com/angussleeping/jd-checkin

## 一、修复的 Bug（5 个）

| # | 文件 | 问题 | 修复方式 |
|---|------|------|---------|
| 1 | function/common.js | 依赖不存在的 eval.js/jxAlgo.js，加载即崩溃，且全仓库无引用 | 直接删除 |
| 2 | sendNotify.js:277 | `await exec()` 假等待——ChildProcess 不是 Promise，CK 检测任务未执行完就继续发通知 | 改用 `util.promisify(exec)` 真正等待，并加错误捕获 |
| 3 | sendNotify.js:150 | 模块加载时裸 `JSON.parse` 缓存文件，文件损坏会拖垮所有脚本的通知功能 | 提取 `safeLoadJson()` 容错函数，损坏时告警并忽略 |
| 4 | ql.js | `params: {t}` 被 got 静默忽略（时间戳参数实际未发出）；正则解析 token 不可靠 | 改用 `searchParams`；优先 `JSON.parse`，正则回退取最后一个 token |
| 5 | jd_indeps.sh | 4 个脚本依赖的 `big-integer` 不在安装清单，新环境必崩 | 补充 `big-integer@1.6.52` |

## 二、安全加固（2 项）

- **jd_gitfix.sh**：`http.sslVerify=false` 由全局生效改为仅对 `gh-proxy.com` 域名生效，其余 git 操作恢复 SSL 校验
- **jdCookie.js**：GitHub Actions 检测由 `JSON.stringify(process.env)` 模糊匹配改为 `GITHUB_ACTIONS === 'true'` 精确判断，消除误伤

## 三、性能与质量优化

- **ql.js 重写**：
  - token 缓存，不再每次 API 调用都读文件
  - 双端口故障转移：5600 拒连/超时自动切 5700（吸收自 function/ql.js）
  - 认证文件缺失时抛出清晰错误（原为先报模糊的 null 路径错误）
  - 消除 `this.getEnvs()` 脆弱绑定，3 处手写 for 循环改 `Array.find()`
- **jdCookie.js**：互助码解析改用 `dotenv.parse()`，不再污染 `process.env`；删除 getIP 死代码约 30 行
- **jd_indeps.sh**：依赖逐个安装改为收集差异后一次性批量 `pnpm i -g`；canvas 清理的 glob 判断修复（`shopt -s nullglob` + 空数组保护）

## 四、重复文件合并（3 组）

统一保留根目录版本，function/ 下改为一行转发 stub：

| 保留版本 | 转发 stub |
|---------|-----------|
| sendNotify.js（20230712 版，接口为超集） | function/sendNotify.js（旧 20221118 版） |
| ql.js（重写增强版） | function/ql.js |
| jdCookie.js（较新版） | function/jdcookie.js |

以后维护只需改根目录一份。

## 五、仓库瘦身（约 2MB）

27 个无任何入口脚本引用的库文件，经静态依赖图分析确认后移除：

- function/：dylank, dylany, dylanz, jdCommon1, jdCrypto, h5st41, getH5st3_0, getToken, savePrize, sendJDNotify, qlApi
- utils/：Rebels_3_0, Rebels_Token, Rebels_proxy, Rebels_savePrize, baseCookie, baseUtils, jsToken, smashUtils
- utils/Rebels/：rebelsa/b/c/m/n/v/x/z（共 8 个）

> 恢复方式：文件保留在 git 历史 `5f96674` 中，`git checkout 5f96674 -- <文件路径>` 即可找回。

## 六、验证情况

- 所有修改文件通过 `node --check` 语法检查
- jdCookie.js、function/jdcookie.js 转发 stub 运行时冒烟测试通过
- 12 个任务脚本的本地 require 依赖完整性扫描通过（无缺失文件）
- `request` 依赖保留：混淆库 dylank 可能引用，删除有风险

## 遗留事项

- ~~USER_AGENTS.js 的 UA 池偏旧~~（已完成：2026-10-25 升级至京东 App 12.x~13.x / Android 12~14 / iOS 15~17，共 42 个真实机型指纹）
- 青龙面板需重新拉库以应用本次优化
