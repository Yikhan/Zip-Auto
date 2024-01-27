<template>
  <div>
    <div>
      <var-button type="info" @click="() => $emit('select:file')">选择附加文件</var-button>
    </div>
    <div v-if="extraFiles.length">
      <p :key="index" v-for="(file, index) in extraFiles" class="file-row">
        文件 {{ index + 1 }} : {{ file }}
      </p>
    </div>
    <p v-else class="file-row">无附加文件</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  extraFiles: string[]
}>()
</script>

<style scoped>
.file-row {
 padding: 12px;
}
</style>
