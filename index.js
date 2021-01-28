const { app, BrowserWindow, shell, Tray, Menu } = require("electron");
const { autoUpdater } = require("electron-updater")

const path = require("path");
const url = require("url");

const Gun = require("gun");
const publicServer = require('http').createServer(Gun.serve);
const localServer = require('http').createServer(Gun.serve); // TODO: make it accept connections from localhost only
const userDataPath = app.getPath('userData');
console.log('Relay peer started on port ' + 8767 + ' with /gun');

let win, publicState, localState, isQuiting, settings = { minimizeOnClose: true, openAtLogin: true };
let tray = null;

function createGun() {
	publicState = Gun({file: userDataPath + '/radata', web: publicServer.listen(8767), multicast: { port: 8765 } });
	localState = Gun({file: userDataPath + '/localState', web: localServer.listen(8768), multicast: false, peers: [] }).get('state');
	localState.get('settings').map().on((v, k) => settings[k] = v);
	localState.get('settings').get('openAtLogin').on(openAtLogin => {
		app.setLoginItemSettings({
			openAtLogin
		});
	});
}

const icon = path.join(__dirname, 'iris-messenger/src/img/icon128.png');

function createWindow() {
	win = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {nodeIntegration: false},
		icon
	});

  if (process.platform !== 'darwin') {
    tray = new Tray(icon);

  	let trayMenu = [
  		{
  			label: 'Quit',
  			type: 'normal',
  			click: () => app.quit()
  		}
  	]

  	// Left click on tray icon opens the app
  	if (process.platform === 'win32') {
  		tray.on('click', () => {
  			win.show();
  		});
  	}
  	// Set the Tray menu with the variable "trayMenu"
  	const menu = Menu.buildFromTemplate(trayMenu);
  	tray.setContextMenu(menu);
  }

	win.removeMenu();

	// load the application source
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, `iris-messenger/src/index.html`),
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

	win.on('close', (event) => {
		if (!isQuiting && settings.minimizeOnClose) {
			event.preventDefault();
			win.minimize();
			event.returnValue = false;
			win.hide();
		}
	});

	const loginItemSettings = app.getLoginItemSettings();
	if (loginItemSettings.wasOpenedAtLogin) {
		win.minimize();
	}

	win.webContents.on('new-window', function(e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
}

app.setLoginItemSettings({
	openAtLogin: true
});

app.on("ready", createWindow);
app.on("ready", createGun);
app.on('before-quit', function () {
	isQuiting = true;
});

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
	if (process.platform !== "darwin" || !settings.minimizeOnClose) {
		app.quit();
	}
});

// initialize the app's main window
app.on("activate", () => {
	if (win === null) {
		createWindow();
	}
});

autoUpdater.checkForUpdatesAndNotify();
