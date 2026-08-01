import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'

// 存到安装目录下会在覆盖安装时被 NSIS 卸载旧版本整个清空，
// 改存到用户的 AppData（等价于 Electron 的 userData 目录），跨安装/升级持久保留。
const userDataDir = join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'zip-auto')
const configFilePath = join(userDataDir, 'config', 'config.json')
// 旧版本曾把配置存到安装目录下，这里做一次性迁移，避免升级后配置看起来“丢失”
const legacyConfigFilePath = join(process.cwd(), 'config', 'config.json')
const defaultConfig = JSON.stringify({ configures: [] }, null, 2)

function ensureConfigFile() {
  if (existsSync(configFilePath)) return
  mkdirSync(dirname(configFilePath), { recursive: true })
  if (existsSync(legacyConfigFilePath)) {
    writeFileSync(configFilePath, readFileSync(legacyConfigFilePath, 'utf-8'), 'utf-8')
    return
  }
  writeFileSync(configFilePath, defaultConfig, 'utf-8')
}

export function readConfigFile() {
  ensureConfigFile()
  const config = readFileSync(configFilePath, 'utf-8')
  return config
}

export function writeConfigFile(config: string) {
  mkdirSync(dirname(configFilePath), { recursive: true })
  writeFileSync(configFilePath, config, 'utf-8')
}
