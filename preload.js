const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowControl: (action) => ipcRenderer.send('window-control', action),
  
  // 菜单操作
  menuAction: (action) => ipcRenderer.send('menu-action', action),
  customMenuAction: (action) => ipcRenderer.send('custom-menu-action', action),
  
  // 退出确认
  showQuitConfirmation: () => ipcRenderer.send('show-quit-confirmation'),
  
  // 监听菜单操作
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});