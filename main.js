const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;
let confirmQuitWindow;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,

    // 窗口边框
    frame: true,
    // icon标志
    icon: 'logo.ico',
    // 自动隐藏菜单栏
    autoHideMenuBar: false,
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
  });
}

function createConfirmQuitWindow() {
  // 如果正在退出或确认窗口已存在，则不再创建新窗口
  if (isQuitting || confirmQuitWindow) {
    if (confirmQuitWindow) {
      confirmQuitWindow.focus();
    }
    return;
  }

  // 创建确认退出窗口
  confirmQuitWindow = new BrowserWindow({
    width: 350,
    height: 200,
    parent: mainWindow, // 设置父窗口
    modal: true, // 设置为模态窗口
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 加载确认退出窗口页面
  confirmQuitWindow.loadFile('child.html');

  // 移除菜单栏
  confirmQuitWindow.setMenu(null);

  // 当确认窗口关闭时
  confirmQuitWindow.on('closed', () => {
    confirmQuitWindow = null;
  });
}

// 创建应用菜单
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS 有特殊的应用菜单
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about', label: `关于 ${app.getName()}` },
        { type: 'separator' },
        { role: 'services', label: '服务' },
      ]
    }] : []),
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            console.log('新建……');
          }
        },
        { type: 'separator' },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            console.log('打开……');
          }
        },
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' }
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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

// 监听退出确认消息
ipcMain.on('confirm-quit', () => {
  isQuitting = true; // 设置退出状态
    
  // 关闭所有窗口并退出应用
  if (confirmQuitWindow) {
    confirmQuitWindow.close();
  }
  
  // 使用更可靠的方式退出应用
  quitApplication();
});

// 监听取消退出消息
ipcMain.on('cancel-quit', () => {
  // 只关闭确认窗口，不退出应用
  if (confirmQuitWindow) {
    confirmQuitWindow.close();
  }
});

// 监听 beforeunload 确认消息
ipcMain.on('show-quit-confirmation', () => {
  // 只有在未退出状态下才显示确认窗口
  if (!isQuitting) {
    createConfirmQuitWindow();
  }
});

//监听后 需要手动触发 quit 事件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 更可靠的退出函数
function quitApplication() {
  // 获取所有窗口并关闭它们
  const windows = BrowserWindow.getAllWindows();
  
  // 先关闭所有窗口
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      win.close();
    }
  });
  
  // 使用 process.exit 作为后备方案
  setTimeout(() => {
    app.quit();
    // 如果 app.quit() 没有生效，使用 process.exit
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }, 100);
}