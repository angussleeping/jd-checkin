const USER_AGENTS = [
  "jdapp;android;13.6.1;;;Mozilla/5.0 (Linux; Android 14; 2304FPN6DC Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 MQQBrowser/6.2 TBS/046807 Mobile Safari/537.36",
  "jdapp;android;13.6.1;;;Mozilla/5.0 (Linux; Android 14; SM-S9180 Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 MQQBrowser/6.2 TBS/046701 Mobile Safari/537.36",
  "jdapp;android;13.2.0;;;Mozilla/5.0 (Linux; Android 13; 2211133C Build/TKQ1.220905.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 MQQBrowser/6.2 TBS/046411 Mobile Safari/537.36",
  "jdapp;android;13.1.6;;;Mozilla/5.0 (Linux; Android 13; 23013RK75C Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 MQQBrowser/6.2 TBS/046411 Mobile Safari/537.36",
  "jdapp;android;13.0.2;;;Mozilla/5.0 (Linux; Android 13; PHB110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.117 MQQBrowser/6.2 TBS/046401 Mobile Safari/537.36",
  "jdapp;android;12.4.0;;;Mozilla/5.0 (Linux; Android 13; V2227A Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.117 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;12.3.5;;;Mozilla/5.0 (Linux; Android 13; PGT-AN10 Build/HONORPGT-AN10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;12.2.2;;;Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 MQQBrowser/6.2 TBS/046201 Mobile Safari/537.36",
  "jdapp;android;12.1.0;;;Mozilla/5.0 (Linux; Android 12; 21091116AC Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 MQQBrowser/6.2 TBS/046201 Mobile Safari/537.36",
  "jdapp;android;12.0.4;;;Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/UD1A.230803.041; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 MQQBrowser/6.2 TBS/046807 Mobile Safari/537.36",
  "jdapp;android;13.1.6;;;Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 MQQBrowser/6.2 TBS/046411 Mobile Safari/537.36",
  "jdapp;android;12.4.0;;;Mozilla/5.0 (Linux; Android 12; ALN-AL00 Build/HUAWEIALN-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;12.2.2;;;Mozilla/5.0 (Linux; Android 12; NOH-AN00 Build/HUAWEINOH-AN00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 MQQBrowser/6.2 TBS/046201 Mobile Safari/537.36",
  "jdapp;android;13.2.0;;;Mozilla/5.0 (Linux; Android 13; PEEM00 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 MQQBrowser/6.2 TBS/046411 Mobile Safari/537.36",
  "jdapp;android;12.3.5;;;Mozilla/5.0 (Linux; Android 13; V2241A Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.117 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;13.0.2;;;Mozilla/5.0 (Linux; Android 13; SM-S9110 Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.117 MQQBrowser/6.2 TBS/046401 Mobile Safari/537.36",
  "jdapp;android;12.1.0;;;Mozilla/5.0 (Linux; Android 12; V2203A Build/SP1A.210812.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 MQQBrowser/6.2 TBS/046201 Mobile Safari/537.36",
  "jdapp;android;13.6.1;;;Mozilla/5.0 (Linux; Android 14; 23127PN0CC Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 MQQBrowser/6.2 TBS/046807 Mobile Safari/537.36",
  "jdapp;android;12.4.0;;;Mozilla/5.0 (Linux; Android 13; PJD110 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;13.1.6;;;Mozilla/5.0 (Linux; Android 13; PGZ-AN10 Build/HONORPGZ-AN10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 MQQBrowser/6.2 TBS/046411 Mobile Safari/537.36",
  "jdapp;android;12.2.2;;;Mozilla/5.0 (Linux; Android 12; 2206123SC Build/RKQ1.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 MQQBrowser/6.2 TBS/046201 Mobile Safari/537.36",
  "jdapp;android;13.0.2;;;Mozilla/5.0 (Linux; Android 13; RMX3562 Build/TP1A.220905.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.5414.117 MQQBrowser/6.2 TBS/046401 Mobile Safari/537.36",
  "jdapp;android;12.3.5;;;Mozilla/5.0 (Linux; Android 12; V2199A Build/SP1A.210812.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 MQQBrowser/6.2 TBS/046224 Mobile Safari/537.36",
  "jdapp;android;13.2.0;;;Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro Build/UQ1A.231205.015; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 MQQBrowser/6.2 TBS/046701 Mobile Safari/537.36",
  "jdapp;iPhone;13.6.1;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.6.1;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.2.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.1.6;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.0.2;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.4.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.3.5;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.2.2;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.1.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.0.4;;;Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_9 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.1.6;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.0.2;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.4.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.2.2;;;Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;13.2.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.3.5;;;Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
  "jdapp;iPhone;12.1.0;;;Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
]
/**
 * 生成随机数字
 * @param {number} min 最小值（包含）
 * @param {number} max 最大值（不包含）
 */
function randomNumber(min = 0, max = 80) {
  return Math.min(Math.floor(min + Math.random() * (max - min)), max);
}
const USER_AGENT = USER_AGENTS[randomNumber(0, USER_AGENTS.length)];

function UARAM (){
  return USER_AGENTS[randomNumber(0, USER_AGENTS.length)];
}

module.exports = {
  USER_AGENT,
  UARAM
}
