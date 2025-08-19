const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    // x y 相对于屏幕左上角的坐标
    x: 100,
    y: 100,
    // 宽高
    width: 800,
    height: 600,
    // show 窗体是否显示
    show: false,
    // 最大、最小宽高
    maxHeight: 1200,
    maxWidth: 1600,
    minHeight: 200,
    minWidth: 100,
    // 尺寸是否可变
    resizable: false,

    webPreferences: {
      // contextIsolation: true, // 默认启用，安全性重要
      // nodeIntegration: false, // 默认禁用，安全性重要
      preload: path.join(__dirname, 'preload.js') // 安全地暴露API给渲染进程
    }
  });

  mainWindow.loadFile('index.html');
  // 开发时打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 当窗体准备完毕可显示时再显示，以防窗体显示和内容加载的显示效果不同步（视觉闪烁）
  mainWindow.on('ready-to-show', ()=>{
    mainWindow.show();
  });

  mainWindow.on('close', ()=>{
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//监听后 需要手动触发 quit 事件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
