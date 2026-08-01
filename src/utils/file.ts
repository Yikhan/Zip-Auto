import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

const configFilePath = join(process.cwd(), 'config', 'config.json')
const defaultConfig = JSON.stringify({ configures: [] }, null, 2)

function ensureConfigFile() {
  if (existsSync(configFilePath)) return
  mkdirSync(dirname(configFilePath), { recursive: true })
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
