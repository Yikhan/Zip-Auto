<template>
  <section class="config">
    <ConfigDropdown
      :configures="configFile.configures"
      :current-config="currentConfig"
      @select:config="onSelectConfig"
      @save:config="onSaveConfig"
    />
  </section>

  <section>
    <var-space direction="row">
      <var-button type="primary" @click="setOutputDirectory">选择输出文件夹</var-button>
      <var-menu-select v-model="outputDirectory" placement="right-start">
        <var-button type="info">使用输入文件的路径</var-button>
        <template #options>
          <var-menu-option v-for="dir in uniqueInputFileDirs" :label="dir" :key="dir" />
        </template>
      </var-menu-select>
    </var-space>
    <p class="output-directory">{{ outputDirectory || '未选择输出文件夹' }}</p>
  </section>

  <section class="password">
    <var-input v-model="password" placeholder="压缩密码" :line="false" />
  </section>
  <section class="suffix">
    <var-input v-model="suffix" placeholder="后缀名" :line="false" />
  </section>

  <section>
    <ExtraFile
      :extra-files="currentConfig.defaultExtraFiles"
      @select:file="() => setExtraFiles(true)"
    />
  </section>

  <section>
    <var-space>
      <var-button type="primary" @click="() => setInputFiles()">选择输入文件</var-button>
      <var-button type="warning" @click="clearInputFiles">清空列表</var-button>
      <var-button type="success" @click="run" :disabled="!isRunEnabled">开始压缩</var-button>
    </var-space>
    <FileBoard :input-files="inputFiles" @drop:files="onDropFiles" @select:files="setInputFiles" />
  </section>

  <var-snackbar
    v-model:show="hasError"
    :duration="10000"
    type="error"
    position="bottom"
    content-class="error"
  >
    {{ error }}
  </var-snackbar>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, reactive, computed } from 'vue'
import { dirname } from 'path'
import { readConfigFile, writeConfigFile } from '~/utils/file'
import { useSelectFileTasks, useSelectFiles, useSelectFolder } from '~/composables/select'
import { useCompress } from '~/composables/compress'
import { useError } from '~/composables/error'
import { Config, FileTask } from '~/types'

//SECTION - 核心变量和修改方法
const {
  files: inputFiles,
  selectFileTasks: setInputFiles,
  clearFiles: clearInputFiles,
} = useSelectFileTasks()
const { files: extraFiles, selectFiles: setExtraFiles } = useSelectFiles()
const { folder: outputDirectory, setFolder: setOutputDirectory } = useSelectFolder()
const { error, hasError } = useError()
const password = ref('')
const suffix = ref('zip')

const { isRunEnabled, run } = useCompress({
  inputFiles,
  outputDirectory,
  extraFiles,
  password,
  suffix,
})

const uniqueInputFileDirs = computed(() => {
  return Array.from(new Set(inputFiles.value.map((file) => dirname(file.filePath)))).sort()
})
//!SECTION

const configFile = ref<{ configures: Config[] }>({
  configures: [],
})
const currentConfig = reactive<Config>({
  name: '',
  id: 0,
  get defaultExtraFiles() {
    return extraFiles.value
  },
  set defaultExtraFiles(value) {
    extraFiles.value = value
  },
  get defaultOutputDirectory() {
    return outputDirectory.value
  },
  set defaultOutputDirectory(value) {
    outputDirectory.value = value
  },
  get defaultPassword() {
    return password.value
  },
  set defaultPassword(value) {
    password.value = value
  },
  get defaultSuffix() {
    return suffix.value
  },
  set defaultSuffix(value) {
    suffix.value = value
  },
})

function readConfig() {
  // 从配置文件中读取默认值
  try {
    configFile.value = JSON.parse(readConfigFile())
  } catch (err: any) {
    setTimeout(() => {
      error.value = err.message
    }, 1000)
  }
}

function onSelectConfig(config: Config) {
  Object.assign(currentConfig, config)
}

function onSaveConfig(config: Config) {
  const index = configFile.value.configures.findIndex((c) => c.id === config.id)
  configFile.value.configures[index] = {
    ...config,
  }

  writeConfigFile(JSON.stringify(configFile.value, null, 2))
}

function onDropFiles(files: FileTask[]) {
  inputFiles.value.push(...files)
}

onBeforeMount(() => {
  readConfig()
  onSelectConfig(configFile.value.configures[0])
})
</script>

<style lang="scss">
.config {
  margin-bottom: 20px;
}

.password {
  margin-bottom: 20px;
  padding-left: 12px;
}

.suffix {
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
