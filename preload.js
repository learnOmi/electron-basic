const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowControl: (action) => ipcRenderer.send('window-control', action),
  
  // 菜单操作
  menuAction: (action) => ipcRenderer.send('menu-action', action),
  customMenuAction: (action) => ipcRenderer.send('custom-menu-action', action),
  
  // 添加菜单项
  addMenuItem: (name) => ipcRenderer.send('add-menu-item', name),
  
  // 右键菜单
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  
  // 退出确认
  showQuitConfirmation: () => ipcRenderer.send('show-quit-confirmation'),
  
  // 监听菜单操作
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
  
  // 监听菜单项添加结果
  onMenuItemAdded: (callback) => ipcRenderer.on('menu-item-added', callback),
  
  // 监听菜单项添加错误
  onMenuItemError: (callback) => ipcRenderer.on('menu-item-error', callback),
  
  // 监听右键菜单操作
  onContextMenuAction: (callback) => ipcRenderer.on('context-menu-action', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});