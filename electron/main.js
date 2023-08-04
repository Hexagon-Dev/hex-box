import {app, BrowserWindow, ipcMain} from 'electron'

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

    ipcMain.on('loginMailService', (event, payload) => {
        const Imap = require('node-imap');

        const imap = new Imap({
            user: payload.email,
            password: payload.password,
            host: payload.host,
            port: payload.port,
            tls: payload.tls,
        });

        imap.on('error', function (err) {
            event.sender.send('emailsFetched', { success: false, error: err.message, payload });
            imap.end();
        });

        imap.on('ready', function () {
            imap.openBox('INBOX', false, function (err) {
                if (err) {
                    event.sender.send('emailsFetched', { success: false, error: err.message });
                    imap.end();
                    return;
                }

                const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
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
                    event.sender.send('emailsFetched', { success: false, error: err.message });
                    imap.end();
                });

                fetch.once('end', function () {
                    event.sender.send('emailsFetched', { success: true, data: emails });
                    imap.end();
                });
            });
        });

        imap.connect();
    })

    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
});
