import { ipcRenderer } from 'electron'

export function invoke(channel: string, ...args: any[]) {
  return ipcRenderer.invoke(channel, ...args)
}
