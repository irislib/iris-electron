const { app, BrowserWindow, shell, Tray, Menu } = require("electron");
const { autoUpdater } = require("electron-updater")

const path = require("path");
const url = require("url");

const Gun = require("gun");
const server = require('http').createServer(Gun.serve);
const userDataPath = app.getPath('userData');
console.log('Relay peer started on port ' + 8767 + ' with /gun');

let win, gun, isQuiting;
let tray = null;

function createGun() {
	gun = Gun({file: userDataPath + '/radata', web: server.listen(8767), multicast: { port: 8765 } });
}

function createWindow() {
	win = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {nodeIntegration: false},
		icon: path.join(__dirname, 'iris-messenger/src/icon128.png')
	});

	// If the platform is Windows use ... else use ... as icon
	const iconName = process.platform === 'win32' ? 'icon.png' : 'icon.png';
	const iconPath = path.join(__dirname, `./build/${iconName}`);
	tray = new Tray(iconPath);

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

	win.removeMenu();

	// load the dist folder from Angular
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
		if (!isQuiting) {
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

app.on("ready", createWindow);
app.on("ready", createGun);
app.on('before-quit', function () {
	isQuiting = true;
});

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
