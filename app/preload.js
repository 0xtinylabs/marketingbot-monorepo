const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        const validChannels = ['log'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
