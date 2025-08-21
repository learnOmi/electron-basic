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

        // 菜单选项卡点击事件
    const menuTabs = document.querySelectorAll('.menu-tab');
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有选项卡的active类
            menuTabs.forEach(t => t.classList.remove('active'));
            
            // 为当前选项卡添加active类
            tab.classList.add('active');
            
            // 获取选项卡标识
            const tabName = tab.getAttribute('data-tab');
            
            // 在控制台输出日志
            console.log(`点击了 ${tabName} 选项卡`);
            
            // 根据选项卡执行不同操作
            switch(tabName) {
                case 'home':
                    console.log('首页选项卡被点击');
                    break;
                case 'settings':
                    console.log('设置选项卡被点击');
                    break;
                case 'help':
                    console.log('帮助选项卡被点击');
                    break;
                case 'about':
                    console.log('关于选项卡被点击');
                    break;
            }
        });
    });

});