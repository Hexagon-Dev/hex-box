import { app, BrowserWindow, ipcMain } from 'electron'
import { googleService } from './services/google';
import { imapService } from './services/imap';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    ipcMain.on('authGoogle', async () => {
        if (await googleService.authorizeGoogle()) {
            mainWindow.webContents.send('authGoogleFinish', { success: true });
        }
    });

    ipcMain.on('authGoogleCodeExchange', async (event, payload) => {
        try {
            await googleService.exchangeGoogleCodes(payload);

            const data = await (await googleService.gmailService()).getProfile({ userId: 'me' });

            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: true, data });
            event.sender.send('authGoogleCodeExchangeFinish', { success: true, data });
        } catch (error) {
            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: false, error });
            event.sender.send('authGoogleCodeExchangeFinish', { success: false, error });
        }
    });

    ipcMain.on('authGoogleCodeExchangeFinishClose', async (event) => {
        event.sender.close();
    });

    ipcMain.on('fetchGoogleProfile', async (event) => {
        const data = await (await googleService.gmailService()).getProfile({ userId: 'me' });

        mainWindow.webContents.send('fetchGoogleProfile', { success: true, data });
    });

    ipcMain.on('fetchEmails', async (event, { account, service }) => {
        let data = null;

        if (service.name === 'Google') {
            data = await (await googleService.gmailService()).fetchMessages();
        } else {
            if (imapService.imapClient === null) {
                imapService.initService({
                    email: account.email,
                    password: account.password,
                    host: service.host,
                    port: service.port,
                    tls: service.tls,
                });
            }

            data = imapService.fetchMessages();
        }

        event.sender.send('fetchEmails', { success: true, data, service: service.name });
    });

    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
});
