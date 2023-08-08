import { app, BrowserWindow, ipcMain } from 'electron'
import { googleService } from './services/google';
import { imapService } from './services/imap';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const requiredEnvVariables = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URL',
];

requiredEnvVariables.forEach((variable) => {
    if (process.env[variable] === undefined) {
        throw Error(`Missing ${variable} environment variable`);
    }
});

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
        if (await googleService.authorizeGoogle(mainWindow)) {
            mainWindow.webContents.send('authGoogleFinish', { success: true });
        }
    });

    ipcMain.on('authGoogleCodeExchange', async (event, payload) => {
        try {
            await googleService.exchangeGoogleCode(payload);

            const data = await (await googleService.gmailService()).getProfile({ userId: 'me' });

            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: true, data });
            event.sender.send('authGoogleCodeExchangeFinish', { success: true, data });
        } catch (error) {
            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: false, error });
            event.sender.send('authGoogleCodeExchangeFinish', { success: false, error });
        }
    });

    ipcMain.on('authGoogleCodeExchangeClose', async (event) => {
        event.sender.close();
    });

    ipcMain.on('fetchGoogleProfile', async () => {
        const data = await (await googleService.gmailService()).getProfile({ userId: 'me' });

        mainWindow.webContents.send('fetchGoogleProfileFinish', { success: true, data });
    });

    ipcMain.on('fetchEmails', async (event, { account, service }) => {
        console.log('\x1b[32m[Main]\x1b[0m', 'fetchEmails', account.email, service.name);

        let data;

        if (service.name === 'Google') {
            const gmailService = await googleService.gmailService();

            data = await gmailService.fetchMessages();
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

        event.sender.send('fetchEmailsFinish', { success: true, data, service: service.name });
    });

    ipcMain.on('removeGoogleAccount', async (event, { email }) => {
        googleService.removeGoogleAccount(email);
    })

    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
});
