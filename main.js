const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let childWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,

    // 窗口边框
    frame: false,
    // icon标志
    icon: 'logo.ico',
    // 自动隐藏菜单栏
    autoHideMenuBar: true,
    // 标题, index.html 中 title 必须删去
    title: 'myWindow',

    webPreferences: {
      // 默认开启，预加载脚本和 Electron API 会被隔离在独立的上下文中, 会隔离渲染进程的全局环境
      contextIsolation: false, 
      // 默认关闭nodejs集成，开启后渲染进程可直接访问所有 nodejs api
      nodeIntegration: true,
      // 开启remote模块(12之后已移除)，允许渲染进程直接使用主进程
      // enableRemoteModule: true,

      // preload: path.join(__dirname, 'preload.js') // 安全地暴露API给渲染进程
    }
  });

  mainWindow.loadFile('index.html');
  // 开发时打开开发者工具
  mainWindow.webContents.openDevTools();

  // 当窗体准备完毕可显示时再显示，以防窗体显示和内容加载的显示效果不同步（视觉闪烁）
  mainWindow.on('ready-to-show', ()=>{
    mainWindow.show();
  });

  // 当窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
    // 同时关闭所有子窗口
    if (childWindow) {
      childWindow.close();
      childWindow = null;
    }
  });
}

function createChildWindow() {
  // 创建子窗口
  childWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow, // 设置父窗口
    modal: true, // 设置为模态窗口
  });

  // 加载子窗口页面
  childWindow.loadFile('child.html');

  // 当子窗口关闭时
  childWindow.on('closed', () => {
    childWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 监听创建子窗口的IPC消息
ipcMain.on('open-child-window', () => {
  if (!childWindow) {
    createChildWindow();
  }
});

// 监听窗口控制消息
ipcMain.on('window-control', (event, action) => {
  if (mainWindow) {
    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        mainWindow.close();
        break;
    }
  }
});

//监听后 需要手动触发 quit 事件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
