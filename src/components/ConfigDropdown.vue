<script setup lang="ts">
import { PropType, onBeforeMount, ref } from 'vue'
import { Config } from '~/interfaces'

const props = defineProps({
  configures: {
    type: Array as PropType<Config[]>,
    default: [],
  },
  currentConfig: {
    type: Object as PropType<Config>,
    default: null,
  },
})

const emit = defineEmits<{
  (e: 'select:config', value: Config): void
  (e: 'save:config'): void
}>()

const show = ref(false)

function onSelectConfig(config: Config) {
  closeMenu()
  emit('select:config', config)
}

function closeMenu() {
  show.value = false
}

function onSaveConfig() {
  emit('save:config')
}
</script>
<template>
  <var-menu offset-x="120px" offset-y="18px" v-model:show="show">
    <var-button type="primary" style="margin-right: 10px">选择预设配置</var-button>
    <template #menu>
      <var-cell v-for="config in configures" class="config-item" @click="onSelectConfig(config)">
        {{ config.name }}
        <var-icon
          v-if="config.name === currentConfig?.name"
          name="checkbox-marked-circle"
          color="var(--color-primary)"
        />
      </var-cell>
    </template>
  </var-menu>
  <var-button type="success" @click="onSaveConfig">保存当前配置</var-button>
</template>

<style lang="scss">
.config-item {
  &:hover {
    cursor: pointer;
    background-color: gray;
  }
}
</style>
