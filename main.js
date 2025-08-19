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

  mainWindow.webContents.on("dom-ready", ()=>{
    console.log('2->dom-ready');
  });

  mainWindow.webContents.on("did-finish-load", ()=>{
    console.log("3->did-finish-load");
  });

  mainWindow.on('close', ()=>{
    console.log("8->this window is closed!");
  });
}

app.whenReady().then(() => {
  console.log("1->app ready");
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//监听后 需要手动触发 quit 事件
app.on('window-all-closed', () => {
    console.log('4->window-all-closed');
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', ()=>{
    console.log('5->before-quit');
});

app.on('will-quit', ()=>{
    console.log('6->will-quit');
});

app.on('quit', ()=>{
    console.log('7->quit');
});