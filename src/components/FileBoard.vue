<template>
  <div id="drop-zone" @dragover.prevent.stop @drop.prevent.stop="handleDrop" class="drop-zone">
    <p v-if="!inputFiles.length" class="file-row file-select" @click="() => emit('select:files')">
      点击选择输入文件 (或拖曳文件到此)
    </p>
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
</template>

<script setup lang="ts">
import { FileTask } from '~/types'
import { basename } from 'path'

defineProps<{
  inputFiles: FileTask[]
}>()

const emit = defineEmits<{
  (e: 'drop:files', files: FileTask[]): void
  (e: 'select:files'): void
}>()

async function handleDrop(event: DragEvent) {
  const files = (event.dataTransfer?.files || []) as {
    name: string
    path: string
  }[]
  const droppedFiles: FileTask[] = []

  for (const file of files) {
    const fileInfo: FileTask = {
      filePath: file.path,
      processing: false,
      done: false,
    }
    droppedFiles.push(fileInfo)
  }

  emit('drop:files', droppedFiles)
}
</script>

<style lang="scss" scoped>
.drop-zone {
  margin-top: 12px;
  min-height: 200px;
  border: 2px dashed #ccc; /* 添加边框以表示拖放区域 */
  text-align: center;
  padding: 20px;
}

.file-row {
  padding: 10px 0px;
  font-size: 14px;

  .file-processing {
    justify-content: flex-end;
  }
}

.file-select {
  cursor: pointer
}
</style>
