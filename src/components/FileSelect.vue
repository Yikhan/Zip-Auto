<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { basename } from 'path'

import { readConfigFile } from '../utils/file'
import { useCompress, useExtra, useInput, useOutput } from './composables/select'
import { useError } from './composables/error'

const { inputFiles, setInputFiles, clearInputFiles } = useInput()
const { inputExtraFiles, setInputExtraFiles } = useExtra()
const { outputDirectory, password, setOutputDirectory } = useOutput()
const { isRunEnabled, run } = useCompress({
  inputFiles,
  inputExtraFiles,
  outputDirectory,
  password,
})
const { error, hasError } = useError()

onBeforeMount(() => {
  // 从配置文件中读取默认值
  let config = {
    defaultExtraDirectory: [],
    defaultOutputDirectory: '',
    defaultPassword: '',
  }
  try {
    config = JSON.parse(readConfigFile())
  } catch (err: any) {
    setTimeout(() => {
      error.value = err.message
    }, 1000)
  }
  inputExtraFiles.value = config.defaultExtraDirectory
  outputDirectory.value = config.defaultOutputDirectory
  password.value = config.defaultPassword
})
</script>

<template>
  <section>
    <var-space justify="space-between">
      <var-button type="primary" @click="setOutputDirectory">选择输出文件夹</var-button>
      <var-button type="success" @click="run" :disabled="!isRunEnabled">开始压缩</var-button>
    </var-space>
    <p class="output-directory">{{ outputDirectory || '未选择输出文件夹' }}</p>
  </section>

  <section>
    <div>
      <var-button type="info" @click="setInputExtraFiles">选择附加文件</var-button>
    </div>
    <div v-if="inputExtraFiles.length">
      <p :key="index" v-for="(file, index) in inputExtraFiles" class="file-row">
        文件 {{ index + 1 }} : {{ file }}
      </p>
    </div>
    <p v-else class="file-row">无附加文件</p>
  </section>

  <section class="password">
    <var-input v-model="password" placeholder="压缩密码" :line="false" />
  </section>

  <section>
    <var-space>
      <var-button type="primary" @click="setInputFiles">选择输入文件</var-button>
      <var-button type="success" @click="clearInputFiles">清空列表</var-button>
    </var-space>
    <div v-if="inputFiles.length">
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
    </div>
    <p v-else class="file-row">未选择输入文件</p>
  </section>

  <var-snackbar
    v-model:show="hasError"
    :duration="5000"
    type="error"
    position="bottom"
    content-class="error"
  >
    {{ error }}
  </var-snackbar>
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

.var-snackbar__wrapper {
  width: auto;

  .error {
    word-wrap: break-word;
    max-width: 400px;
  }
}
</style>
