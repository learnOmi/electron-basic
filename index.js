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

    // 添加菜单项按钮
    document.getElementById('addMenuItemBtn').addEventListener('click', () => {
        const menuItemName = document.getElementById('menuItemName').value.trim();
        if (menuItemName) {
            // 发送添加菜单项的请求到主进程
            window.electronAPI.addMenuItem(menuItemName);
            document.getElementById('menuItemName').value = ''; // 清空输入框
        } else {
            addLogEntry('请输入菜单项名称');
        }
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

    // 监听菜单项添加结果
    window.electronAPI.onMenuItemAdded((event, menuItemName) => {
        addLogEntry(`已添加菜单项: ${menuItemName}`);
    });
    
    // 监听菜单项添加错误
    window.electronAPI.onMenuItemError((event, errorMessage) => {
        addLogEntry(`错误: ${errorMessage}`);
    });
    
    // 添加操作日志功能
    function addLogEntry(message) {
        const logContainer = document.getElementById('logContent');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        
        logEntry.innerHTML = `<span class="log-time">[${timeString}]</span> ${message}`;
        
        // 如果日志为空，移除等待消息
        if (logContainer.firstChild?.textContent === '等待操作...') {
            logContainer.innerHTML = '';
        }
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // 初始日志
    addLogEntry('应用程序已启动');
});