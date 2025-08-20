const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn1');
    btn.addEventListener('click', () => {
        // 发送消息给主进程，请求打开子窗口
        ipcRenderer.send('open-child-window');
    });
});