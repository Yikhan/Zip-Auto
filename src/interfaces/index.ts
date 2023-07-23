export interface FileTask {
  filePath: string
  processing: boolean
  done: boolean
}

export interface Config {
  name: string
  defaultExtraDirectory: string[]
  defaultOutputDirectory: string
  defaultPassword: string
}
