const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded',()=>{
    // 确认退出按钮
    document.getElementById('confirm-yes').addEventListener('click', () => {
        ipcRenderer.send('confirm-quit');
    });

    // 取消退出按钮
    document.getElementById('confirm-no').addEventListener('click', () => {
        ipcRenderer.send('cancel-quit');
    });
})
