const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

// contextBridge.exposeInMainWorld('api', {
//   backendUrl: "https://pharmalogs.abdulfortech.com/api"
// });
