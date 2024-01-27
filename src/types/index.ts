export type FileTask = {
  filePath: string
  processing: boolean
  done: boolean
}

export type Config = {
  name: string
  defaultExtraFiles: string[]
  defaultOutputDirectory: string
  defaultPassword: string
  id: number
}
