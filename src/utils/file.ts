import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'

const configFilePath = join(process.cwd(), 'config', 'config.json')

export function readConfigFile() {
  const config = readFileSync(configFilePath, 'utf-8')
  return config
}

export function writeConfigFile(config: string) {
  writeFileSync(configFilePath, config, 'utf-8')
}
