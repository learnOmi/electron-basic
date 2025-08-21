const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // 监听 beforeunload 事件
    window.onbeforeunload = function (e) {
        // 显示确认退出窗口
        ipcRenderer.send('show-quit-confirmation');

        // 返回任意值以显示确认对话框（某些浏览器会显示）
        // 但在 Electron 中，我们使用自定义窗口，所以不需要这个
        return false;
    };

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