<template>
  <var-space>
    <var-menu offset-x="120px" offset-y="18px" v-model:show="show">
      <var-button type="primary">选择预设配置</var-button>
      <template #menu>
        <var-cell v-for="config in configures" class="config-item" @click="onSelectConfig(config)">
          {{ config.name }}
          <var-icon
            v-if="config.id === currentConfig.id"
            name="checkbox-marked-circle"
            color="var(--color-primary)"
          />
        </var-cell>
      </template>
    </var-menu>
    <DialogSaveConfig :current-config="currentConfig" @save:config="onSaveConfig"/>
  </var-space>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import { Config } from '~/types'

defineProps({
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
  (e: 'save:config', value: Config): void
}>()

const show = ref(false)

function onSelectConfig(config: Config) {
  closeMenu()
  emit('select:config', config)
}

function closeMenu() {
  show.value = false
}

function onSaveConfig(value: Config) {
  emit('save:config', value)
}
</script>

<style lang="scss">
.config-item {
  &:hover {
    cursor: pointer;
    background-color: gray;
  }
}
</style>
