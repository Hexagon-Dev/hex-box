<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-toolbar class="px-4">
            <v-checkbox hide-details />

            <v-btn icon class="mr-2" @click="fetchMails"><v-icon>mdi-refresh</v-icon></v-btn>
            <v-btn icon disabled class="mr-2"><v-icon>mdi-archive</v-icon></v-btn>
            <v-btn icon disabled><v-icon>mdi-delete</v-icon></v-btn>
          </v-toolbar>

          <v-list v-if="isEmailsLoading">
            <v-list-item class="pa-0"><v-skeleton-loader type="list-item-avatar" /></v-list-item><v-divider />
            <v-list-item class="pa-0"><v-skeleton-loader type="list-item-avatar" /></v-list-item><v-divider />
            <v-list-item class="pa-0"><v-skeleton-loader type="list-item-avatar" /></v-list-item><v-divider />
            <v-list-item class="pa-0"><v-skeleton-loader type="list-item-avatar" /></v-list-item><v-divider />
            <v-list-item class="pa-0"><v-skeleton-loader type="list-item-avatar" /></v-list-item>
          </v-list>

          <v-list v-else>
            <template v-for="(email, key) in mails.data" :key="key">
              <v-list-item>
                <template v-slot:prepend>
                  <v-checkbox hide-details class="mr-4" />
                </template>

                <v-list-item-title>{{ email.title }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ email.sender }}: {{ email.snippet }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <span class="mr-2" :title="formatDate(new Date(email.received_at))">
                    {{ formatDateToNow(new Date(email.received_at)) }} ago
                  </span>

                  <v-btn size="small" variant="flat" icon class="mr-2"><v-icon>mdi-archive</v-icon></v-btn>
                  <v-btn size="small" variant="flat" icon><v-icon>mdi-delete</v-icon></v-btn>
                </template>
              </v-list-item>

              <v-divider v-if="key !== mails.data.length - 1" />
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = window.require('electron');

import { useServicesStore } from '../../stores/services';
import { useMailsStore } from '../../stores/mails';
import { useAccountsStore } from '../../stores/accounts';
import {differenceInMinutes, format, formatDistanceToNow, parse} from "date-fns";
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';

export default {
  components: { VSkeletonLoader },
  data() {
    return {
      isEmailsLoading: false,
    };
  },
  computed: {
    serviceStore() {
      return useServicesStore();
    },
    accountsStore() {
      return useAccountsStore();
    },
    mailsStore() {
      return useMailsStore();
    },
    mails() {
      return this.mailsStore.mails;
    },
    account: {
      get() {
        return this.accountsStore.getCurrentAccount;
      },
      set(value) {
        this.accountsStore.setCurrentAccountId(value);
      },
    },
    service() {
      return this.serviceStore.getServiceById(this.account.serviceId);
    }
  },
  watch: {
    account() {
      this.fetchMails();
    },
  },
  mounted() {
    if (
      this.mails.updatedAt === null
      || differenceInMinutes(new Date, parse(this.mails.updatedAt, 'dd-MM-yyyy HH:mm', new Date())) > 1
    ) {
      this.fetchMails();
    }

    ipcRenderer.on('fetchEmailsFinish', (event, emails) => {
      if (emails.success === false) {
        console.error(emails.error);

        return;
      }

      const parsedEmails = [];

      switch (this.service.name) {
        case 'Google':
          emails.data.forEach(email => parsedEmails.push({
            sender: email.payload.headers.find(header => header.name === 'From').value,
            title: email.payload.headers.find(header => header.name === 'Subject').value,
            snippet: email.snippet,
            received_at: email.payload.headers.find(header => header.name === 'Date').value,
          }));

          break;
        default:
          console.log(emails);

          break;
      }

      this.mailsStore.setMails(parsedEmails);

      this.isEmailsLoading = false;
    });
  },
  methods: {
    fetchMails() {
      const payload = {
        account: {...this.account},
        service: {...this.service},
      };

      this.isEmailsLoading = true;

      ipcRenderer.send('fetchEmails', payload);
    },
    formatDate(date) {
      return format(date, 'dd-MM-yyyy HH:mm');
    },
    formatDateToNow(date) {
      return formatDistanceToNow(date);
    },
  },
};
</script>
