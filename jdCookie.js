/*
此文件为Node.js专用。其他用户请忽略
 */
// 此处填写京东账号cookie（青龙/呆呆面板用户直接在环境变量 JD_COOKIE 里填即可，这里保持空数组）
let CookieJDs = [
  '', // 账号一ck，例：pt_key=XXX;pt_pin=XXX;
  '', // 账号二ck，例：pt_key=XXX;pt_pin=XXX;如有更多，依次类推
]
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
// GITHUB_ACTIONS 强制退出 —— 滥用公共 CI 会导致仓库和账号被封
if (process.env.GITHUB_ACTIONS === 'true') {
  console.log(`请勿使用github action运行此脚本，无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
  !(async () => {
    try {
      await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
    } catch (e) {
      console.log('通知发送失败：' + e.message)
    }
    process.exit(0);
  })()
}

CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
console.log(`\n====================共${CookieJDs.length}个京东账号Cookie=================\n`);
console.log(`============脚本执行时间：${formatdate(new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000))}=============\n`)
console.log('>>>>>>>>>>>>>>Faker提醒您：有问题先更新 关注频道https://t.me/scriptalking>>>>>>>>>>>>>>>\n')

// 日志中只保留 pt_pin，隐藏 pt_key，避免 CK 随日志外泄
function maskCK(ck) {
  return String(ck).replace(/(pt_key=)[^;]*/i, '$1***')
}

for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n提示:京东cookie 【${maskCK(CookieJDs[i])}】填写不规范，可能会影响部分脚本正常使用。正确格式为: pt_key=xxx;pt_pin=xxx;（分号;不可少）\n`);
  CookieJDs[i] = CookieJDs[i].replace(/[\u4e00-\u9fa5]/g, (str) => encodeURI(str));
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}

// ============ 代理池模式 ============
// 环境变量：DP_POOL = 代理池地址（需先 pnpm i -g global-agent）
//          PERMIT_JS = 允许走代理的脚本文件名，& 分隔
let permit = process.env.PERMIT_JS ? process.env.PERMIT_JS.split('&') : '';
if (process.env.DP_POOL) {
  const curFile = process.mainModule && process.mainModule.filename ? process.mainModule.filename : process.argv[1]
  const hit = permit && permit.some((x) => curFile && curFile.includes(x))
  if (hit) {
    try {
      require('global-agent/bootstrap');
      global.GLOBAL_AGENT.HTTP_PROXY = process.env.DP_POOL;
      console.log(`\n---------------使用代理池模式---------------\n`);
    } catch {
      throw new Error(`请先安装 global-agent 依赖（jd_indeps.sh 或 pnpm i -g global-agent）才能启用代理池！`);
    }
  }
}

// ============ 互助码注入 ============
// 环境变量：ShareCodeConfigChineseName / ShareCodeConfigName / ShareCodeEnvName
// 这些变量通常由面板的 task_before.sh 注入，一般无需手动配置
function SetShareCodesEnv(nameChinese = '', nameConfig = '', envName = '') {
  const fs = require('fs');
  const dir = process.env.QL_DIR || '/ql';
  const shareCodeLogPath = fs.existsSync(`${dir}/data`) ? `${dir}/data/log/.ShareCode/${nameConfig}.log` : `${dir}/log/.ShareCode/${nameConfig}.log`;
  if (fs.existsSync(shareCodeLogPath)) {
    require('dotenv').config({ path: shareCodeLogPath });
  } else {
    return;
  }

  // 收集每个账号的互助码（变量名以 My${nameConfig} 开头）
  const codes = {};
  Object.keys(process.env).forEach(function (key) {
    if (key.startsWith(`My${nameConfig}`)) codes[key] = process.env[key];
  });

  // 解析互助组：把 ${变量} 占位符替换成实际互助码
  const helpOtherCodes = {};
  Object.keys(process.env).forEach(function (key) {
    if (key.startsWith(`ForOther${nameConfig}`)) {
      let helpCode = process.env[key];
      for (const [codeEnv, codeVal] of Object.entries(codes)) {
        helpCode = helpCode.replace('${' + codeEnv + '}', codeVal);
      }
      helpOtherCodes[key] = helpCode;
    }
  });

  // ptask 并行触发时只处理一部分互助码
  let leftIndex = 1, rightIndex = Object.keys(helpOtherCodes).length;
  if (process.env.PTASK_LEFT && process.env.PTASK_RIGHT) {
    leftIndex = Number(process.env.PTASK_LEFT);
    rightIndex = Number(process.env.PTASK_RIGHT);
  }

  const shareCodes = [];
  for (let idx = leftIndex; idx <= rightIndex; idx++) {
    shareCodes.push(helpOtherCodes[`ForOther${nameConfig}${idx}`]);
  }
  process.env[envName] = shareCodes.join('&');
}

const nameChinese = process.env.ShareCodeConfigChineseName;
const nameConfig = process.env.ShareCodeConfigName;
const envName = process.env.ShareCodeEnvName;
if (nameChinese && nameConfig && envName) {
  SetShareCodesEnv(nameChinese, nameConfig, envName);
}

function formatdate(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
