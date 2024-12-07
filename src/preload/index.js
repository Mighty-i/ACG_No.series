import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  fetchCompany: () => ipcRenderer.invoke('fetch-company')  // ส่งคำขอไปที่ main process
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)  // expose ฟังก์ชันให้ renderer process
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api  // expose ฟังก์ชันให้ renderer process
}
