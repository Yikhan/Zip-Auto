import { computed, ref } from 'vue'

export function useError() {
  const error = ref<string>('')

  const hasError = computed({
    get: () => !!error.value,
    set: (value: boolean) => {
      error.value = ''
    },
  })

  return {
    error,
    hasError,
  }
}
