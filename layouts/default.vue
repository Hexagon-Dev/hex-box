<template>
  <v-main>
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
        <v-list-item :active="$route.name === 'accounts'" @click="$router.push('/accounts')">
          <template v-slot:prepend><v-icon>mdi-account</v-icon></template>

          <v-list-item-title>Accounts</v-list-item-title>
        </v-list-item>

        <v-list-item :active="$route.name === 'settings'" @click="$router.push('/settings')">
          <template v-slot:prepend><v-icon>mdi-cog</v-icon></template>

          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list>
        <v-list-item v-for="[icon, text, route] in links" :key="icon" :active="$route.path === route" @click="$router.push(route)">
          <template v-slot:prepend><v-icon>{{ icon }}</v-icon></template>

          <v-list-item-title>{{ text }}</v-list-item-title>
        </v-list-item>
      </v-list>

      {{ account }}
    </v-navigation-drawer>

    <slot />
    <ModalGlobal />
  </v-main>
</template>

<script>
import { useAccountsStore } from '../stores/accounts';

export default {
  data() {
    return {
      drawer: null,
      links: [
        ['mdi-inbox-arrow-down', 'Inbox', '/mail/inbox'],
        ['mdi-star', 'Starred', '/mail/starred'],
        ['mdi-send', 'Sent', '/mail/sent'],
        ['mdi-file-outline', 'Drafts', '/mail/drafts'],
        ['mdi-delete', 'Trash', '/mail/trash'],
        ['mdi-alert-octagon', 'Spam', '/mail/spam'],
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
    }
  },
};
</script>