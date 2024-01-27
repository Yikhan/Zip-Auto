import { ref } from 'vue'
import { FileTask } from '~/types'
import { invoke } from '~/utils/channel'

export function useSelectFileTasks() {
  const files = ref<FileTask[]>([])

  async function selectFileTasks() {
    const result = await invoke('open-files')
    if (!result) return

    result.filePaths.forEach((file: string) => {
      files.value.push({
        filePath: file,
        processing: false,
        done: false,
      })
    })
  }

  function clearFiles() {
    files.value.splice(0, files.value.length)
  }

  return {
    files,
    selectFileTasks,
    clearFiles,
  }
}

export function useSelectFiles() {
  const files = ref<string[]>([])

  async function selectFiles() {
    const result = await invoke('open-files')
    if (!result) return

    result.filePaths.forEach((file: string) => {
      files.value.push(file)
    })
  }

  function clearFiles() {
    files.value.splice(0, files.value.length)
  }

  return {
    files,
    selectFiles,
    clearFiles,
  }
}

export function useSelectFolder() {
  const folder = ref<string>('')

  async function setFolder() {
    const result = await invoke('open-folder')
    if (!result) return

    folder.value = result.filePaths[0]
  }

  return {
    folder,
    setFolder,
  }
}
