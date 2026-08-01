import { computed, ref } from 'vue'
import { join, parse } from 'path'
import { FileTask } from '~/types'
import type { Ref } from 'vue'
import { compressFile } from '~/utils/bandizip'
import { existsSync, mkdirSync, rmdirSync } from 'fs'
import { unlink } from 'fs/promises'

export function useCompress(options: {
  inputFiles: Ref<FileTask[]>
  outputDirectory: Ref<string>
  extraFiles: Ref<string[]>
  password: Ref<string>
  suffix: Ref<string>
  archiveComment: Ref<string>
}) {
  const { inputFiles, outputDirectory, extraFiles, password, suffix, archiveComment } = options

  const isRunning = ref(false)
  const isRunEnabled = computed(() => {
    return !isRunning.value && inputFiles.value.length > 0 && outputDirectory.value
  })

  function getTempDirectory() {
    // 独立于最终输出目录，避免最终后缀与临时的 .zip 撞名时互相覆盖/误删
    return join(outputDirectory.value, '.zip-auto-tmp')
  }

  async function stepFirst() {
    const tempDirectory = getTempDirectory()
    if (!existsSync(tempDirectory)) {
      mkdirSync(tempDirectory, { recursive: true })
    }

    // step1. 压缩视频文件
    for (let file of inputFiles.value) {
      if (file.done) {
        continue
      }

      file.processing = true
      await compressFile({
        filePath: file.filePath,
        outputDirectory: tempDirectory,
        fileSuffix: '.zip',
        extraFils: [],
        password: password.value,
        archiveComment: archiveComment.value,
      })
    }
  }

  async function stepSecond() {
    const tempDirectory = getTempDirectory()

    // step2. 再压缩一次
    for (let file of inputFiles.value) {
      if (file.done) {
        continue
      }

      const filePathFromLastStep = join(tempDirectory, parse(file.filePath).name + '.zip')

      await compressFile({
        filePath: filePathFromLastStep,
        outputDirectory: outputDirectory.value,
        fileSuffix: `.${suffix.value}`,
        extraFils: extraFiles.value,
        archiveComment: archiveComment.value,
      })

      // 删除上一步生成的临时zip文件
      try {
        await unlink(filePathFromLastStep)
      } catch (err) {
        console.log(err)
      }
      file.processing = false
      file.done = true
    }

    try {
      rmdirSync(tempDirectory)
    } catch (err) {
      // 临时目录非空（例如某个文件处理失败）时忽略，留给下次清理
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
