import { readFileSync } from 'fs'
import { join, dirname } from 'path'

const configFilePath = join(process.cwd(), 'config', 'config.json')

export function readConfigFile() {
  const config = readFileSync(configFilePath, 'utf-8')
  return config
}
