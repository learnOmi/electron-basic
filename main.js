const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog, shell } = require('electron');
const path = require('path');

let mainWindow;
let confirmQuitWindow;
let isQuitting = false;
// 存储自定义菜单项
let customMenuItems = [];

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
      contextIsolation: true, 
      // 默认关闭nodejs集成，开启后渲染进程可直接访问所有 nodejs api
      nodeIntegration: false,
      // 开启remote模块(12之后已移除)，允许渲染进程直接使用主进程
      // enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js') // 安全地暴露API给渲染进程
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
            console.log('新建文件');
            mainWindow.webContents.send('menu-action', 'new-file');
          }
        },
        { type: 'separator' },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            console.log('打开文件');
            mainWindow.webContents.send('menu-action', 'open-file');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { 
          role: 'undo', 
          label: '撤销',
          click: () => {
            mainWindow.webContents.send('menu-action', 'edit-undo');
          }
        },
        { 
          role: 'redo', 
          label: '重做',
          click: () => {
            mainWindow.webContents.send('menu-action', 'edit-redo');
          }
        },
        { type: 'separator' },
        { 
          role: 'cut', 
          label: '剪切',
          click: () => {
            mainWindow.webContents.send('menu-action', 'edit-cut');
          }
        },
        { 
          role: 'copy', 
          label: '复制',
          click: () => {
            mainWindow.webContents.send('menu-action', 'edit-copy');
          }
        },
        { 
          role: 'paste', 
          label: '粘贴',
          click: () => {
            mainWindow.webContents.send('menu-action', 'edit-paste');
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '首页',
          click: () => {
            console.log('切换到首页');
            mainWindow.webContents.send('menu-action', 'view-home');
          }
        },
        {
          label: '设置',
          click: () => {
            console.log('切换到设置');
            mainWindow.webContents.send('menu-action', 'view-settings');
          }
        },
        {
          label: '帮助',
          click: () => {
            console.log('切换到帮助');
            mainWindow.webContents.send('menu-action', 'view-help');
          }
        },
        {
          label: '关于',
          click: () => {
            console.log('切换到关于');
            mainWindow.webContents.send('menu-action', 'view-about');
          }
        },
        { type: 'separator' },
        { 
          role: 'reload', 
          label: '重新加载',
          click: () => {
            mainWindow.webContents.send('menu-action', 'view-reload');
          }
        },
        { 
          role: 'forceReload', 
          label: '强制重新加载',
          click: () => {
            mainWindow.webContents.send('menu-action', 'view-force-reload');
          }
        },
        { 
          role: 'toggleDevTools', 
          label: '开发者工具',
          click: () => {
            mainWindow.webContents.send('menu-action', 'view-dev-tools');
          }
        }
      ]
    },
    // 添加自定义菜单
    {
      label: '自定义',
      id: 'custom-menu', // 添加ID以便后续查找
      submenu: [
        // 初始时为空，将通过动态添加填充
        {
          label: '暂无自定义菜单项',
          enabled: false
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 添加自定义菜单项
function addCustomMenuItem(menuItemName) {
  try {
    // 获取当前应用菜单
    const appMenu = Menu.getApplicationMenu();
    
    // 查找自定义菜单
    const customMenu = appMenu.getMenuItemById('custom-menu');
    
    if (!customMenu) {
      throw new Error('找不到自定义菜单');
    }
    
    // 如果是第一个自定义菜单项，移除"暂无自定义菜单项"
    if (customMenu.submenu.items.length === 1 && 
        customMenu.submenu.items[0].label === '暂无自定义菜单项') {
      customMenu.submenu.clear();
    }
    
    // 创建新菜单项
    const newMenuItem = new MenuItem({
      label: menuItemName,
      click: () => {
        console.log(`点击了自定义菜单项: ${menuItemName}`);
        mainWindow.webContents.send('menu-action', `custom-${menuItemName}`);
      }
    });
    
    // 添加新菜单项
    customMenu.submenu.append(newMenuItem);
    
    // 存储菜单项信息
    customMenuItems.push(menuItemName);
    
    // 通知渲染进程添加成功
    mainWindow.webContents.send('menu-item-added', menuItemName);
    
    return true;
  } catch (error) {
    console.error('添加菜单项失败:', error);
    mainWindow.webContents.send('menu-item-error', error.message);
    return false;
  }
}

// 创建右键菜单
function createContextMenu() {
  const template = [
    {
      label: '复制',
      role: 'copy',
      click: () => {
        console.log('右键菜单: 复制');
        mainWindow.webContents.send('context-menu-action', 'copy');
      }
    },
    {
      label: '粘贴',
      role: 'paste',
      click: () => {
        console.log('右键菜单: 粘贴');
        mainWindow.webContents.send('context-menu-action', 'paste');
      }
    },
    { type: 'separator' },
    {
      label: '重新加载',
      click: () => {
        console.log('右键菜单: 重新加载');
        mainWindow.webContents.send('context-menu-action', 'reload');
        mainWindow.reload();
      }
    },
    {
      label: '检查元素',
      click: () => {
        console.log('右键菜单: 检查元素');
        mainWindow.webContents.send('context-menu-action', 'inspect');
        mainWindow.webContents.inspectElement(mainWindow.getPosition()[0], mainWindow.getPosition()[1]);
      }
    },
    { type: 'separator' },
    {
      label: '关于此应用',
      click: () => {
        console.log('右键菜单: 关于此应用');
        mainWindow.webContents.send('context-menu-action', 'about');
      }
    }
  ];

  return Menu.buildFromTemplate(template);
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

// 监听自定义菜单操作
ipcMain.on('custom-menu-action', (event, action) => {
  console.log(`自定义菜单操作: ${action}`);
  // 这里可以根据需要执行相应的操作
});

// 监听右键菜单显示请求
ipcMain.on('show-context-menu', () => {
  const contextMenu = createContextMenu();
  contextMenu.popup({
    window: mainWindow,
    callback: () => {
      console.log('右键菜单已关闭');
    }
  });
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

// 监听添加菜单项消息
ipcMain.on('add-menu-item', (event, menuItemName) => {
  addCustomMenuItem(menuItemName);
});

// 在 ipcMain 监听部分添加对话框处理
ipcMain.on('open-dialog', async (event, type) => {
    if (!mainWindow) return;
    
    try {
        let result;
        
        switch (type) {
            case 'open':
                result = await dialog.showOpenDialog(mainWindow, {
                    properties: ['openFile', 'multiSelections'],
                    filters: [
                        { name: '所有文件', extensions: ['*'] },
                        { name: '文本文件', extensions: ['txt', 'md'] },
                        { name: '图片', extensions: ['jpg', 'png', 'gif'] }
                    ],
                    title: '选择文件'
                });
                break;
                
            case 'save':
                result = await dialog.showSaveDialog(mainWindow, {
                    filters: [
                        { name: '文本文件', extensions: ['txt'] },
                        { name: '所有文件', extensions: ['*'] }
                    ],
                    title: '保存文件'
                });
                break;
                
            case 'info':
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: '信息',
                    message: '这是一个信息对话框',
                    detail: '这里是详细信息内容',
                    buttons: ['确定', '取消']
                });
                result = { message: '用户查看了信息对话框' };
                break;
                
            case 'error':
                await dialog.showErrorBox('错误标题', '这是一个错误消息内容');
                result = { message: '用户查看了错误对话框' };
                break;
                
            default:
                result = { canceled: true };
        }
        
        // 发送对话框结果回渲染进程
        event.sender.send('dialog-result', result);
    } catch (error) {
        console.error('对话框错误:', error);
        event.sender.send('dialog-result', { 
            canceled: true, 
            error: error.message 
        });
    }
});

// 监听 Shell 操作请求
ipcMain.on('shell-open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    event.sender.send('shell-result', { success: true, message: `已打开外部链接: ${url}` });
  } catch (error) {
    event.sender.send('shell-result', { success: false, message: `打开链接失败: ${error.message}` });
  }
});

ipcMain.on('shell-show-item-in-folder', async (event, filePath) => {
  try {
    // 如果没有提供路径，使用当前目录的示例
    const pathToShow = filePath || __dirname;
    shell.showItemInFolder(pathToShow);
    event.sender.send('shell-result', { success: true, message: `已在文件夹中显示: ${pathToShow}` });
  } catch (error) {
    event.sender.send('shell-result', { success: false, message: `显示项目失败: ${error.message}` });
  }
});

ipcMain.on('shell-trash-item', async (event, filePath) => {
  try {
    // 创建一个临时文件用于演示
    const tempDir = app.getPath('temp');
    const demoFile = path.join(tempDir, 'electron-demo-file.txt');
    
    // 确保文件存在
    const fs = require('fs');
    fs.writeFileSync(demoFile, '这是一个演示文件，用于展示移动到回收站功能');
    
    shell.trashItem(demoFile);
    event.sender.send('shell-result', { success: true, message: `已移动到回收站: ${demoFile}` });
  } catch (error) {
    event.sender.send('shell-result', { success: false, message: `移动到回收站失败: ${error.message}` });
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