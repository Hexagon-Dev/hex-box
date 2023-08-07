import { googleService } from './google';

export const gmailService = {
  gmail: null,

  initService(gmail) {
    this.gmail = gmail;

    return this;
  },

  async fetchMessages() {
    const response = await this.gmail.users.messages.list({ userId: 'me' });
    const { messages } = response.data;

    const requests = [];

    messages.forEach(message => requests.push(this.gmail.users.messages.get({
      userId: 'me',
      id: message.id
    })));

    const results = await Promise.all(requests);

    const data = [];

    results.forEach(result => data.push(result.data));

    return data;
  },

  async getProfile() {
    const response = await this.gmail.users.getProfile({userId: 'me'});

    return response.data;
  }
};
