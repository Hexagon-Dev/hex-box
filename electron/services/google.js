import { BrowserWindow } from 'electron';
import { gmailService } from './gmail';

const Store = require('electron-store');
const { google } = require('googleapis');

const store = new Store();

export const googleService = {
  gmail: null,

  oauth2Client: new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL,
  ),

  async authorizeGoogle(parentWindow) {
    if (this.authorizeFromStorage()) {
      return true;
    }

    this.log('Authorizing google', process.env.GOOGLE_REDIRECT_URL)

    const authorizationUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://mail.google.com/',
      include_granted_scopes: true
    });

    this.log('Authorization url:')
    this.log(authorizationUrl)

    const win = new BrowserWindow({
      parent: parentWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    let ua = win.webContents.userAgent;
    ua = ua.replace(/APPLICATION NAME HERE\/[0-9.-]*/,'');
    ua = ua.replace(/Electron\/*/,'');
    win.webContents.userAgent = ua;

    await win.loadURL(authorizationUrl);

    const promise = new Promise((resolve) => {
      win.on('closed', () => {
        this.log('Google authorization window closed');
        resolve();
      });
    });

    await promise;

    return true;
  },

  authorizeFromStorage(email) {
    const string = store.get(`googleOauth.${email}`);

    if (!string) {
      return false;
    }

    const tokens = JSON.parse(string);

    this.setGoogleTokens(tokens);

    this.log('Authorized google from storage');

    return true;
  },

  async exchangeGoogleCode(payload) {
    this.log('Exchanging code');

    let { tokens } = await this.oauth2Client.getToken(payload.code);

    this.setGoogleTokens(tokens);
  },

  persistGoogleTokens(email) {
    this.log('Saving token to storage');

    const tokens = JSON.stringify(this.oauth2Client.credentials);

    store.set(`googleOauth.${email}`, tokens);
  },

  removeGoogleAccount(email) {
    this.log('Removing token from storage and revoking it');

    store.delete(`googleOauth.${email}`);

    this.oauth2Client.revokeToken(this.oauth2Client.credentials.access_token);
    this.oauth2Client.revokeToken(this.oauth2Client.credentials.refresh_token);

    this.log('Removed google account from storage');
  },

  setGoogleTokens(tokens) {
    this.log('Setting google token');

    this.oauth2Client.setCredentials(tokens);

    google.options({ auth: this.oauth2Client });

    this.gmail = google.gmail('v1');
  },

  async gmailService() {
    if (!this.gmail) {
      await this.authorizeGoogle();
    }

    return gmailService.initService(this.gmail);
  },

  log(text, ...values) {
    console.log('\x1b[32m[Google]\x1b[0m', text, ...values);
  }
};
