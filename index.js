const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // 打开子窗口按钮
    document.getElementById('openChildBtn').addEventListener('click', () => {
        ipcRenderer.send('open-child-window');
    });

    // 窗口控制按钮
    document.getElementById('minimize-btn').addEventListener('click', () => {
        ipcRenderer.send('window-control', 'minimize');
    });

    document.getElementById('maximize-btn').addEventListener('click', () => {
        ipcRenderer.send('window-control', 'maximize');
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        ipcRenderer.send('window-control', 'close');
    });
});