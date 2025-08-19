// 预加载脚本
const { contextBridge } = require('electron');

// 通过 contextBridge 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('myAPI', {
  // 这里可以定义一些你希望渲染进程可以调用的方法
  doSomething: () => {}
});