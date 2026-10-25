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
