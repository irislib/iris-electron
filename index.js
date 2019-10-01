const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater")

const path = require("path");
const url = require("url");

const Gun = require("gun");
const server = require('http').createServer(Gun.serve(__dirname + "iris-angular/dist"));
const userDataPath = app.getPath('userData');
console.log('Relay peer started on port ' + 8765 + ' with /gun');

let win, gun;

function createGun() {
  gun = Gun({file: userDataPath + '/radata', web: server.listen(8765), multicast: { port: 8765 } });
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {nodeIntegration: false},
    icon: path.join(__dirname, 'iris-angular/dist/assets/images/icon128.png')
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `iris-angular/dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // The following is optional and will open the DevTools:
  if (process.env.DEV) {
    win.webContents.openDevTools();
  }

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);
app.on("ready", createGun);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

app.setLoginItemSettings({
  openAtLogin: true
});

autoUpdater.checkForUpdatesAndNotify();
