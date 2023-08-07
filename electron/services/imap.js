import Imap from 'node-imap';

export const imapService = {
  imapClient: null,

  initService(email, password, host, port, tls) {
    this.imapClient = new Imap({ user: email, password, host, port, tls });

    return this;
  },

  fetchMessages(account, service) {
    let result = {};

    this.imapClient.on('error', function (err) {
      result = {
        success: false,
        error: err.message,
        payload: {account, service}
      };

      this.imapClient.end();
    });

    this.imapClient.on('ready', () => {
      this.imapClient.openBox('INBOX', false, (err) => {
        if (err) {
          result = { success: false, error: err.message };
          this.imapClient.end();
          return;
        }

        const fetchOptions = {bodies: ['HEADER', 'TEXT'], struct: true};
        const fetch = this.imapClient.seq.fetch('1:*', fetchOptions);

        const emails = [];

        fetch.on('message', (msg) => {
          const emailData = {};

          msg.on('body', (stream, info) => {
            let buffer = '';

            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });

            stream.on('end', () => {
              if (info.which === 'HEADER') {
                emailData.headers = Imap.parseHeader(buffer);
              } else if (info.which === 'TEXT') {
                emailData.text = buffer;
              }
            });
          });

          msg.once('end', () => {
            emails.push(emailData);
          });
        });

        fetch.once('error', (err) => {
          result = {success: false, error: err.message};
          this.imapClient.end();
        });

        fetch.once('end', () => {
          result = {success: true, data: emails};
          this.imapClient.end();
        });
      });
    });

    this.imapClient.connect();

    return result;
  },
};