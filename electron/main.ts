import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Store from 'electron-store';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, 'public')
	: RENDERER_DIST;

let win: BrowserWindow | null;
const store = new Store();

function createWindow() {
	win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
		width: 1200,
		height: 800,
		minWidth: 1200,
		minHeight: 800,
		title: '',
		titleBarStyle: 'hiddenInset',
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.mjs'),
			webSecurity: false,
		},
	});

	if (process.env.NODE_ENV === 'development') {
		win.webContents.openDevTools();
	}

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(RENDERER_DIST, 'index.html'));
	}
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
		win = null;
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.whenReady().then(createWindow);

ipcMain.handle('get-settings', () => {
	return store.get('userSettings', {});
});

ipcMain.on('update-settings', (event, newSettings) => {
	const currentSettings = store.get('userSettings', {}) as Record<
		string,
		unknown
	>;
	store.set('userSettings', { ...currentSettings, ...newSettings });
	event.sender.send('settings-updated', newSettings);
});

ipcMain.handle('save-background', (filePath) => {
	if (typeof filePath !== 'string') {
		throw new TypeError('The "path" argument must be of type string.');
	}

	const saveDirectory = path.join(app.getPath('userData'), 'backgrounds');
	const fileName = path.basename(filePath);
	const destination = path.join(saveDirectory, fileName);

	if (!fs.existsSync(saveDirectory)) {
		fs.mkdirSync(saveDirectory);
	}

	if (!fs.existsSync(destination)) {
		try {
			fs.copyFileSync(filePath, destination);
		} catch (error) {
			console.error('Failed to copy file:', error);
			throw new Error('Failed to save file');
		}
	}

	store.set('userBackground', destination);

	return destination;
});
