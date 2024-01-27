import { computed, ref } from 'vue'
import { join, parse } from 'path'
import { FileTask } from '~/types'
import type { Ref } from 'vue'
import { compressFile } from '~/utils/bandizip'
import { unlink } from 'fs'

export function useCompress(options: {
  inputFiles: Ref<FileTask[]>
  outputDirectory: Ref<string>
  extraFiles: Ref<string[]>
  password: Ref<string>
}) {
  const { inputFiles, outputDirectory, extraFiles, password } = options

  const isRunning = ref(false)
  const isRunEnabled = computed(() => {
    return !isRunning.value && inputFiles.value.length > 0 && outputDirectory.value
  })

  async function stepFirst() {
    // step1. 压缩视频文件
    for (let file of inputFiles.value) {
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
    for (let file of inputFiles.value) {
      if (file.done) {
        continue
      }

      const filePathFromLastStep = join(outputDirectory.value, parse(file.filePath).name + '.zip')

      await compressFile({
        filePath: filePathFromLastStep,
        outputDirectory: outputDirectory.value,
        fileSuffix: '.video',
        extraFils: extraFiles.value,
      })

      // 删除上一步生成的临时zip文件
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
