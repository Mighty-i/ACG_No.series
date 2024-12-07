import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// เพิ่มฟังก์ชันเพื่อดึงข้อมูลจาก API
ipcMain.handle('fetch-company', async () => {
  try {
    const response = await axios.post(
      'https://iappapi.ach.co.th/api/booking/query-company',
      {}, // ข้อมูลที่ต้องการส่งใน request body
      {
        headers: {
          'Authorization': '5ae8cb61a66c37d8d2c0496bcfc75502705a9556fd1a408cba3c8029f952daed'
        }
      }
    )
    return response.data.data  // ส่งข้อมูลที่ได้กลับไปที่ renderer process
  } catch (error) {
    console.error('Error fetching data:', error)
    return { error: 'Unable to fetch data' }  // กรณีเกิดข้อผิดพลาด
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
