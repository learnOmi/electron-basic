window.addEventListener('DOMContentLoaded', () => {
    // 监听 beforeunload 事件
    window.onbeforeunload = function (e) {
        window.electronAPI.showQuitConfirmation();
        return false;
    };

    // 窗口控制按钮
    document.getElementById('minimize-btn').addEventListener('click', () => {
        window.electronAPI.windowControl('minimize');
    });

    document.getElementById('maximize-btn').addEventListener('click', () => {
        window.electronAPI.windowControl('maximize');
    });

    document.getElementById('close-btn').addEventListener('click', () => {
        window.electronAPI.windowControl('close');
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
            
            // 发送自定义菜单操作
            window.electronAPI.customMenuAction(`tab-${tabName}`);
            
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
    
    // 监听来自主进程的菜单操作
    window.electronAPI.onMenuAction((event, action) => {
        console.log(`收到菜单操作: ${action}`);
        
        // 根据菜单操作更新UI状态
        if (action.startsWith('view-')) {
            const viewName = action.replace('view-', '');
            const tab = document.querySelector(`.menu-tab[data-tab="${viewName}"]`);
            if (tab) {
                menuTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            }
        }
    });
});