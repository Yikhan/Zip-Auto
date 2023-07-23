<script setup lang="ts">
import FileSelect from './components/FileSelect.vue'

import { StyleProvider, Themes } from '@varlet/ui'

StyleProvider(Themes.dark)
</script>

<template>
  <FileSelect />
</template>

<style>
/* body {
  transition: background-color 0.25s, color 0.25s;
  color: var(--color-text);
  background-color: var(--color-body);
} */
</style>
