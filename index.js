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

    // 监听右键点击事件
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.electronAPI.showContextMenu();
    });

    // 监听打开对话框按钮
    document.getElementById('openDialogBtn').addEventListener('click', () => {
        window.electronAPI.openDialog('open');
    });

    // 监听对话框结果
    window.electronAPI.onDialogResult((event, result) => {
        if (result && !result.canceled) {
            if (result.filePaths) {
                addLogEntry(`选择了文件: ${result.filePaths.join(', ')}`);
            } else if (result.message) {
                addLogEntry(`对话框消息: ${result.message}`);
            }
        } else {
            addLogEntry('用户取消了对话框操作');
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

        // 监听右键菜单操作
    window.electronAPI.onContextMenuAction((event, action) => {
        console.log(`右键菜单操作: ${action}`);
        addLogEntry(`右键菜单: ${action}`);
    });

    document.getElementById('openChildBtn').addEventListener('click', () => {
        window.open('child-window.html', 'childWindow', 'width=600,height=400');
        addLogEntry('打开了子窗口');
    });

    // 监听localStorage的变化（来自子窗口的消息）
    window.addEventListener('storage', (e) => {
        if (e.key === 'childToParentMessage') {
            const message = JSON.parse(e.newValue);
            addLogEntry(`收到子窗口消息: ${message.text}`);
        }
    });

    // 在UI中添加发送消息的功能
    const sendMessageSection = document.createElement('div');
    sendMessageSection.className = 'add-menu-section';
    sendMessageSection.innerHTML = `
        <h2>向子窗口发送消息</h2>
        <div class="input-group">
            <input type="text" id="messageToChild" placeholder="输入要发送到子窗口的消息">
            <button class="btn" id="sendToChildBtn">发送</button>
        </div>
    `;

    document.querySelector('.content').insertBefore(sendMessageSection, document.querySelector('.action-log'));

    document.getElementById('sendToChildBtn').addEventListener('click', () => {
        const messageInput = document.getElementById('messageToChild');
        const message = messageInput.value.trim();
        
        if (message) {
            sendMessageToChild(message);
            messageInput.value = '';
        }
    });

    // 添加发送消息到子窗口的功能
    function sendMessageToChild(message) {
        const messageObj = {
            text: message,
            timestamp: new Date().toLocaleTimeString(),
            from: 'parent'
        };
        
        localStorage.setItem('parentToChildMessage', JSON.stringify(messageObj));
        window.dispatchEvent(new Event('storage'));
        addLogEntry(`向子窗口发送消息: ${message}`);
    }
    
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