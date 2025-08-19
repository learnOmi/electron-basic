const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // contextIsolation: true, // 默认启用，安全性重要
      // nodeIntegration: false, // 默认禁用，安全性重要
      preload: path.join(__dirname, 'preload.js') // 安全地暴露API给渲染进程
    }
  });

  mainWindow.loadFile('index.html');
  // 开发时打开开发者工具
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});