import { app, BrowserWindow } from 'electron'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.whenReady().then(() => {
    new BrowserWindow({
        width: 1280,
        height: 720
    }).loadURL(process.env.VITE_DEV_SERVER_URL);
});
