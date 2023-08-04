<template>
  <v-navigation-drawer v-model="drawer" style="user-select: none;">
    <v-sheet color="grey-4" class="pa-4">
      <v-avatar class="mb-4" color="grey-darken-1" size="64" />

      <v-select
        variant="outlined" density="compact" hide-details item-title="email" item-value="id"
        v-model="account" :items="accountsStore.accounts"
      />
    </v-sheet>

    <v-divider />

    <v-list>
      <v-list-item :active="currentMenu === 'accounts'" @click="currentMenu = 'accounts'">
        <template v-slot:prepend><v-icon>mdi-account</v-icon></template>

        <v-list-item-title>Accounts</v-list-item-title>
      </v-list-item>

      <v-list-item :active="currentMenu === 'settings'" @click="currentMenu = 'settings'">
        <template v-slot:prepend><v-icon>mdi-cog</v-icon></template>

        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list>
      <v-list-item v-for="[icon, text, menu] in links" :key="icon" :active="currentMenu === menu" @click="currentMenu = menu">
        <template v-slot:prepend><v-icon>{{ icon }}</v-icon></template>

        <v-list-item-title>{{ text }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-main>
    <Accounts v-if="currentMenu === 'accounts'" />
    <Mailbox v-if="currentMenu.includes('mailbox')" :tab="currentMenu.split('.')?.at(1)" :emails="emails" />
  </v-main>
</template>

<script>
const { ipcRenderer } = window.require('electron');

import { useServicesStore } from '../stores/services';
import { useAccountsStore } from '../stores/accounts';

export default {
  name: 'Index',
  data() {
    return {
      drawer: null,
      links: [
        ['mdi-inbox-arrow-down', 'Inbox', 'mailbox.inbox'],
        ['mdi-star', 'Starred', 'mailbox.starred'],
        ['mdi-send', 'Sent', 'mailbox.sent'],
        ['mdi-file-outline', 'Drafts', 'mailbox.drafts'],
        ['mdi-delete', 'Trash', 'mailbox.trash'],
        ['mdi-alert-octagon', 'Spam', 'mailbox.spam'],
      ],
      currentMenu: 'accounts',
      emails: [],
      isEmailsLoading: false,
    };
  },
  computed: {
    accountsStore() {
      return useAccountsStore();
    },
    serviceStore() {
      return useServicesStore();
    },
    account: {
      get() {
        return this.accountsStore.getCurrentAccount;
      },
      set(value) {
        this.accountsStore.setCurrentAccountId(value);
      },
    },
  },
  mounted() {
    if (!this.account) {
      this.$router.push('/');
      return;
    }

    const service = this.serviceStore.getServiceById(this.account.serviceId);

    ipcRenderer.send('loginMailService', {...this.account, ...service});

    ipcRenderer.on('emailsFetched', (event, emails) => {
      if (emails.success === false) {
        console.error(emails.error);

        return;
      }

      this.emails = emails.data;
    });
  },
};
</script>
