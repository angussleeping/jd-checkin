'use strict'

const got = require('got')
require('dotenv').config()
const { readFile } = require('fs/promises')
const path = require('path')

const qlDir = '/ql'
const fs = require('fs')
const tokenFileList = ['/ql/data/db/keyv.sqlite', '/ql/data/config/auth.json', '/ql/config/auth.json']

//const authFile = path.join(qlDir, 'config/auth.json');
let authFile = getLatestFile(tokenFileList)
let cachedToken = null
// 主端口 5600，失败时自动回退 5700
const HOSTS = ['http://127.0.0.1:5600', 'http://127.0.0.1:5700']
function api(options) {
    const req = got.extend({ prefixUrl: HOSTS[0], retry: { limit: 0 }, timeout: { request: 5000 } })(options)
    ;['json', 'text', 'buffer'].forEach((m) => {
        const orig = req[m].bind(req)
        req[m] = () =>
            orig().catch((e) =>
                ['ECONNREFUSED', 'ETIMEDOUT'].includes(e.code)
                    ? got.extend({ prefixUrl: HOSTS[1], retry: { limit: 0 }, timeout: { request: 5000 } })(options)[m]()
                    : Promise.reject(e)
            )
    })
    return req
}
function getLatestFile(files) {
    let latestFile = null
    let latestMtime = 0
    for (const file of files) {
        try {
            const stats = fs.statSync(file)
            const mtime = stats.mtimeMs
            if (mtime > latestMtime) {
                latestMtime = mtime
                latestFile = file
            }
        } catch (e) {}
    }
    return latestFile
}
async function getToken() {
    if (cachedToken) return cachedToken
    if (!authFile) {
        throw new Error(`未找到青龙认证文件，已检查路径: ${tokenFileList.join(', ')}`)
    }
    const content = await readFile(authFile, 'utf-8')
    try {
        cachedToken = JSON.parse(content).token
    } catch (e) {
        // keyv.sqlite 等非 JSON 格式回退到正则提取（取最后一个 token 字段，最新写入的在末尾）
        const match = content.match(/"token":"([^"]*)"(?!.*"token":)/)
        if (!match) throw new Error(`无法从 ${authFile} 中解析 token`)
        cachedToken = match[1]
    }
    if (!cachedToken) throw new Error(`无法从 ${authFile} 中解析 token`)
    return cachedToken
}

async function getEnvs() {
    const token = await getToken()
    const body = await api({
        url: 'api/envs',
        searchParams: {
            searchValue: 'JD_COOKIE',
            t: Date.now(),
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body.data
}

module.exports.getEnvs = getEnvs

module.exports.getEnvsCount = async () => {
    const data = await getEnvs()
    return data.length
}

module.exports.addEnv = async (cookie, remarks) => {
    const token = await getToken()
    const body = await api({
        method: 'post',
        url: 'api/envs',
        searchParams: { t: Date.now() },
        json: [
            {
                name: 'JD_COOKIE',
                value: cookie,
                remarks,
            },
        ],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}

module.exports.updateEnv = async (cookie, eid, remarks) => {
    const token = await getToken()
    const body = await api({
        method: 'put',
        url: 'api/envs',
        searchParams: { t: Date.now() },
        json: {
            name: 'JD_COOKIE',
            value: cookie,
            _id: eid,
            remarks,
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}

module.exports.updateEnv11 = async (cookie, eid, remarks) => {
    const token = await getToken()
    const body = await api({
        method: 'put',
        url: 'api/envs',
        searchParams: { t: Date.now() },
        json: {
            name: 'JD_COOKIE',
            value: cookie,
            id: eid,
            remarks,
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}

module.exports.DisableCk = async (eid) => {
    const token = await getToken()
    const body = await api({
        method: 'put',
        url: 'api/envs/disable',
        searchParams: { t: Date.now() },
        json: [eid],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}

module.exports.EnableCk = async (eid) => {
    const token = await getToken()
    const body = await api({
        method: 'put',
        url: 'api/envs/enable',
        searchParams: { t: Date.now() },
        json: [eid],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}

// 按 _id 或 id 查找环境变量（兼容新旧版青龙）
async function findEnvById(eid) {
    const envs = await getEnvs()
    return envs.find((env) => (env._id ?? env.id) == eid)
}

module.exports.getstatus = async (eid) => {
    const env = await findEnvById(eid)
    return env ? env.status : 99
}

module.exports.getEnvById = async (eid) => {
    const env = await findEnvById(eid)
    return env ? env.value : ''
}

module.exports.getEnvByPtPin = async (Ptpin) => {
    const envs = await getEnvs()
    const env = envs.find((item) => {
        const match = item.value.match(/pt_pin=([^; ]+)(?=;?)/)
        return match && decodeURIComponent(match[1]) == Ptpin
    })
    return env || ''
}

module.exports.delEnv = async (eid) => {
    const token = await getToken()
    const body = await api({
        method: 'delete',
        url: 'api/envs',
        searchParams: { t: Date.now() },
        json: [eid],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json()
    return body
}
