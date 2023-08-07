import {app, BrowserWindow, ipcMain} from 'electron'
const Store = require('electron-store');

const store = new Store();

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

    const { google } = require('googleapis');

    let gmail = null;

    function authStorageGoogle() {
        const string = store.get('googleOauth');

        if (!string) {
            authGoogle();

            return;
        }

        const tokens = JSON.parse(string);

        oauth2Client.setCredentials(tokens);

        google.options({ auth: oauth2Client });

        gmail = google.gmail('v1');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL,
    );

    function authGoogle() {
        const authorizationUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://mail.google.com/',
            include_granted_scopes: true
        });

        new BrowserWindow({
            parent: mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        }).loadURL(authorizationUrl);
    }

    ipcMain.on('authGoogle', (event) => authGoogle());

    ipcMain.on('authGoogleCodeExchange', async (event, payload) => {
        try {
            let { tokens } = await oauth2Client.getToken(payload.code);

            store.set('googleOauth', JSON.stringify(tokens));

            oauth2Client.setCredentials(tokens);

            google.options({ auth: oauth2Client });

            gmail = google.gmail('v1');

            const response = await gmail.users.getProfile({ userId: 'me' });

            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: true, data: response.data });
            event.sender.send('authGoogleCodeExchangeFinish', { success: true, data: response.data });
        } catch (e) {
            mainWindow.webContents.send('authGoogleCodeExchangeFinish', { success: false, error: e });
            event.sender.send('authGoogleCodeExchangeFinish', { success: false, error: e });
        }
    });

    ipcMain.on('authGoogleCodeExchangeFinishClose', async (event) => {
        event.sender.close();
    });

    ipcMain.on('loginMailService', async (event, { account, service }) => {
        if (service.name === 'Google') {
            if (!gmail) {
                await authStorageGoogle();
            }

            const response = await gmail.users.messages.list({ userId: 'me'} );
            const { messages } = response.data;

            const requests = [];

            messages.forEach(message => requests.push(gmail.users.messages.get({ userId: 'me', id: message.id } )));

            const results = await Promise.all(requests);

            const data = [];

            results.forEach(result => data.push(result.data));

            event.sender.send('emailsFetched', { success: true, data, service: 'Google' });

            return;
        }

        const Imap = require('node-imap');

        const imap = new Imap({
            user: account.email,
            password: account.password,
            host: service.host,
            port: service.port,
            tls: service.tls,
        });

        imap.on('error', function (err) {
            event.sender.send('emailsFetched', {
                success: false,
                error: err.message,
                payload: {account, service}
            });
            imap.end();
        });

        imap.on('ready', function () {
            imap.openBox('INBOX', false, function (err) {
                if (err) {
                    event.sender.send('emailsFetched', {success: false, error: err.message});
                    imap.end();
                    return;
                }

                const fetchOptions = {bodies: ['HEADER', 'TEXT'], struct: true};
                const fetch = imap.seq.fetch('1:*', fetchOptions);

                const emails = [];

                fetch.on('message', function (msg) {
                    const emailData = {};

                    msg.on('body', function (stream, info) {
                        let buffer = '';

                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });

                        stream.on('end', function () {
                            if (info.which === 'HEADER') {
                                emailData.headers = Imap.parseHeader(buffer);
                            } else if (info.which === 'TEXT') {
                                emailData.text = buffer;
                            }
                        });
                    });

                    msg.once('end', function () {
                        emails.push(emailData);
                    });
                });

                fetch.once('error', function (err) {
                    event.sender.send('emailsFetched', {success: false, error: err.message});
                    imap.end();
                });

                fetch.once('end', function () {
                    event.sender.send('emailsFetched', {success: true, data: emails});
                    imap.end();
                });
            });
        });

        imap.connect();
    })

    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
});
