import { parse, join } from 'path'
import { exec } from 'child_process'

export async function compressFile(options: {
  filePath: string
  outputDirectory: string
  fileSuffix?: string
  extraFils?: string[]
  password?: string
}) {
  const { filePath, outputDirectory, fileSuffix = '', extraFils = [], password = '' } = options

  let outputFileName = parse(filePath).name
  // add customized suffix
  if (fileSuffix) {
    outputFileName += `${fileSuffix}`
  }

  const fullOutputPath = join(outputDirectory, outputFileName)
  const switches = [password ? ` -p:${password}` : '']
  // base command of Bandizip
  let compressCommand = `Bandizip.exe a`
  // add all switches
  switches.forEach((switchItem) => {
    compressCommand += ` ${switchItem}`
  })
  // add archive path and file path
  compressCommand += ` "${fullOutputPath}" "${filePath}"`
  // add extra files
  extraFils.forEach((file) => {
    compressCommand += ` "${file}"`
  })

  return new Promise((resolve, reject) => {
    exec(compressCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(`error: ${error.message}`)
        reject(error)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        reject(stderr)
        return
      }
      if (stdout) {
        console.log(`stdout: ${stdout}`)
      }
      console.log(`finish job: ${filePath}`)
      resolve(true)
    })
  })
}
