<template>
  <var-button type="success" @click="show = true">保存当前配置</var-button>
  <var-dialog v-model:show="show" @confirm="handleSaveConfig">
    <template #title>
      <var-icon name="information" color="#2979ff" />
    </template>

    <var-cell>
      <span>当前配置名:</span>
      <var-input v-model="configName"></var-input>
    </var-cell>
  </var-dialog>
</template>

<script setup lang="ts">
import { ref, watchEffect, toRefs } from 'vue'
import { Config } from '~/types'

const props = defineProps<{
  currentConfig: Config
}>()
const emit = defineEmits<{
  (e: 'save:config', config: Config): void
}>()
const { currentConfig } = toRefs(props)

const configName = ref(currentConfig.value.name)
const show = ref(false)

watchEffect(() => {
  configName.value = currentConfig.value.name
})

function handleSaveConfig() {
  // emit event
  emit('save:config', {
    ...props.currentConfig,
    name: configName.value,
  })

  // close dialog
  show.value = false
}
</script>

<style lang="scss" scoped></style>
