const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('majinboot', {
  notify: (payload) => ipcRenderer.invoke('notify', payload),
});
