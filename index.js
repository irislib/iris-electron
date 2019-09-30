const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

const Gun = require("gun");
const server = require('http').createServer(Gun.serve(__dirname + "iris-angular/dist"));
const gun = Gun({web: server.listen(8765), multicast: { port: 8765 } });
console.log('Relay peer started on port ' + 8765 + ' with /gun');

let win;

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
