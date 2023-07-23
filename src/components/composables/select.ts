import { computed, reactive, ref } from 'vue'
import { join, parse } from 'path'
import { FileTask } from '~/interfaces'
import type { Ref } from 'vue'
import { compressFile } from '~/utils/bandizip'
import { invoke } from '~/utils/channel'
import { unlink } from 'fs'

export function useInput() {
  const inputFiles = reactive<FileTask[]>([])

  async function setInputFiles() {
    const result = await invoke('open-files')
    if (!result) return

    result.filePaths.forEach((file: string) => {
      inputFiles.push({
        filePath: file,
        processing: false,
        done: false,
      })
    })
  }

  function clearInputFiles() {
    inputFiles.splice(0, inputFiles.length)
  }

  return {
    inputFiles,
    setInputFiles,
    clearInputFiles,
  }
}

export function useExtra() {
  const inputExtraFiles = ref<string[]>([])

  async function setInputExtraFiles() {
    const result = await invoke('open-files')
    if (!result) return

    inputExtraFiles.value = result.filePaths
  }

  return {
    inputExtraFiles,
    setInputExtraFiles,
  }
}

export function useOutput() {
  const outputDirectory = ref<string>('')
  const password = ref<string>('')

  async function setOutputDirectory() {
    const result = await invoke('open-folder')
    if (!result) return

    outputDirectory.value = result.filePaths[0]
  }

  return {
    outputDirectory,
    password,
    setOutputDirectory,
  }
}

export function useCompress(options: {
  inputFiles: FileTask[]
  outputDirectory: Ref<string>
  inputExtraFiles: Ref<string[]>
  password: Ref<string>
}) {
  const { inputFiles, outputDirectory, inputExtraFiles, password } = options

  const isRunning = ref(false)
  const isRunEnabled = computed(() => {
    return !isRunning.value && inputFiles.length > 0 && outputDirectory.value
  })

  async function stepFirst() {
    // step1. 压缩视频文件
    for (let file of inputFiles) {
      if (file.done) {
        continue
      }

      file.processing = true
      await compressFile({
        filePath: file.filePath,
        outputDirectory: outputDirectory.value,
        fileSuffix: '.zip',
        extraFils: [],
        password: password.value,
      })
    }
  }

  async function stepSecond() {
    // step2. 再压缩一次
    for (let file of inputFiles) {
      if (file.done) {
        continue
      }

      const filePathFromLastStep = join(outputDirectory.value, parse(file.filePath).name + '.zip')

      await compressFile({
        filePath: filePathFromLastStep,
        outputDirectory: outputDirectory.value,
        fileSuffix: '.video',
        extraFils: inputExtraFiles.value,
      })

      // delete the file from last step
      unlink(filePathFromLastStep, (err: any) => {
        if (err) {
          console.log(err)
        }
      })
      file.processing = false
      file.done = true
    }
  }

  async function run() {
    isRunning.value = true

    try {
      await stepFirst()
      await stepSecond()
    } catch (err) {
      console.log(err)
    }

    isRunning.value = false
  }

  return { isRunning, isRunEnabled, run }
}
