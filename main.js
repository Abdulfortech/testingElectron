const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // ✅ required
      enableRemoteModule: false,
      nodeIntegration: false    // ✅ keep secure
    },
    icon: path.join(__dirname, "assets/img/logo-icon.png") // ✅ add this
  });

  win.loadFile('index.html');
}

ipcMain.on("print-transaction", (event, content) => {
  const printWin = new BrowserWindow({ show: false });
  printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(content));

  printWin.webContents.on("did-finish-load", () => {
    printWin.webContents.print({ silent: false, printBackground: true });
  });
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

