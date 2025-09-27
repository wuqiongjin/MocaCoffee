const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的方法，允许渲染进程使用
contextBridge.exposeInMainWorld('electronAPI', {
    // 这里可以添加需要在渲染进程中使用的API
    platform: process.platform,
    versions: process.versions
});
