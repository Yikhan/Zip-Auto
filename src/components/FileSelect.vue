<script setup lang="ts">
import { ref, reactive } from 'vue'
import { parse, join, basename } from 'path'
import { unlink } from 'fs'
import { FileTask } from '~/interfaces'
import { compressFile } from '~/utils/bandizip'
import { invoke } from '~/utils/channel'
import config from '@/config/config.json'

const inputFiles = reactive<FileTask[]>([])
const inputExtraFiles = ref<string[]>(config.defaultExtraDirectory)
const outputDirectory = ref<string>(config.defaultOutputDirectory)
const password = ref<string>(config.defaultPassword)

// run button control
const isRunning = ref(false)

async function setOutputDirectory() {
  const result = await invoke('open-folder')
  if (!result) return

  outputDirectory.value = result.filePaths[0]
}

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

  console.log(inputFiles)
}

async function setExtraFileToCompress() {
  const result = await invoke('open-files')
  if (!result) return

  inputExtraFiles.value = result.filePaths
}

async function run() {
  isRunning.value = true
  // step1. 压缩视频文件
  for (let file of inputFiles) {
    file.processing = true
    file.done = false
    await compressFile(file.filePath, outputDirectory.value, '.zip', [], password.value)
  }
  // step2. 再压缩一次
  for (let file of inputFiles) {
    const filePathFromLastStep = join(outputDirectory.value, parse(file.filePath).name + '.zip')
    await compressFile(filePathFromLastStep, outputDirectory.value, '.video', inputExtraFiles.value)
    // delete the file from last step
    unlink(filePathFromLastStep, (err: any) => {
      if (err) {
        console.log(err)
      }
    })
    file.processing = false
    file.done = true
  }

  isRunning.value = false
}
</script>

<template>
  <section>
    <var-space justify="space-between">
      <var-button type="primary" @click="setOutputDirectory">选择输出文件夹</var-button>
      <var-button type="success" @click="run" :disabled="isRunning || inputFiles.length === 0"
        >开始压缩</var-button
      >
    </var-space>
    <p class="output-directory">{{ outputDirectory }}</p>
  </section>

  <section>
    <div>
      <var-button type="info" @click="setExtraFileToCompress">选择附加文件</var-button>
    </div>
    <p :key="index" v-for="(file, index) in inputExtraFiles" class="file-row">
      文件 {{ index + 1 }} : {{ file }}
    </p>
  </section>

  <section class="password">
    <var-input v-model="password" placeholder="压缩密码" :line="false" />
  </section>

  <section>
    <div>
      <var-button type="primary" @click="setInputFiles">选择输入文件</var-button>
    </div>
    <var-row :key="index" v-for="(file, index) in inputFiles" class="file-row">
      <var-col :span="16"> 文件 {{ index + 1 }} : {{ basename(file.filePath) }} </var-col>
      <var-col :span="8" class="file-processing">
        <var-loading v-if="file.processing" type="cube" color="#00c48f" />
        <var-icon
          v-if="file.done"
          name="checkbox-marked-circle"
          :size="24"
          color="var(--color-success)"
        />
      </var-col>
    </var-row>
  </section>
</template>

<style lang="scss">
.file-row {
  padding: 10px 12px;
  font-size: 14px;

  .file-processing {
    justify-content: flex-end;
  }
}

.password {
  margin-bottom: 20px;
  padding-left: 12px;
}

.output-directory {
  color: whitesmoke;
  padding: 10px 12px;
  font-size: 14px;
}
</style>
