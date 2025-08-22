window.addEventListener('DOMContentLoaded', () => {
    // 关闭按钮
    document.getElementById('close-btn').addEventListener('click', () => {
        window.close();
    });

    // 发送消息按钮
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    // 按Enter键发送消息
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 监听localStorage的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'parentToChildMessage') {
            displayMessage(JSON.parse(e.newValue), false);
        }
    });

    // 也检查可能已经存在的消息
    checkForMessages();
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        // 创建消息对象
        const messageObj = {
            text: message,
            timestamp: new Date().toLocaleTimeString(),
            from: 'child'
        };
        
        // 存储到localStorage
        localStorage.setItem('childToParentMessage', JSON.stringify(messageObj));
        
        // 触发storage事件（同源页面可以监听到）
        // 注意：storage事件只在其他窗口中触发，不在当前窗口触发
        window.dispatchEvent(new Event('storage'));
        
        // 显示在自己窗口中
        displayMessage(messageObj, true);
        
        // 清空输入框
        messageInput.value = '';
    }
}

function displayMessage(message, isOwn) {
    const messagesContainer = document.getElementById('messagesContainer');
    
    // 移除"等待消息"提示
    if (messagesContainer.firstChild?.textContent === '等待消息...') {
        messagesContainer.innerHTML = '';
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isOwn ? 'own' : ''}`;
    messageElement.innerHTML = `
        <div>${message.text}</div>
        <small>${message.timestamp} - ${message.from}</small>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function checkForMessages() {
    // 检查是否有来自父窗口的消息
    const message = localStorage.getItem('parentToChildMessage');
    if (message) {
        displayMessage(JSON.parse(message), false);
    }
}