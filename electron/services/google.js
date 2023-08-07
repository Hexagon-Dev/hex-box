const { google } = require('googleapis');
import { BrowserWindow } from 'electron';
import { gmailService } from './gmail';
const Store = require('electron-store');

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

    const authorizationUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://mail.google.com/',
      include_granted_scopes: true
    });

    const win = new BrowserWindow({
      parent: parentWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    await win.loadURL(authorizationUrl);

    const promise = new Promise((resolve) => {
      win.on('closed', () => {
        resolve();
      });
    });

    await promise;

    return true;
  },

  authorizeFromStorage() {
    const string = store.get('googleOauth');

    if (!string) {
      return false;
    }

    const tokens = JSON.parse(string);

    this.setGoogleTokens(tokens);

    console.log('[Google] Authorized google from storage');

    return true;
  },

  async exchangeGoogleCodes(payload) {
    let { tokens } = await this.oauth2Client.getToken(payload.code);

    store.set('googleOauth', JSON.stringify(tokens));

    this.setGoogleTokens(tokens);
  },

  setGoogleTokens(tokens) {
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
};
