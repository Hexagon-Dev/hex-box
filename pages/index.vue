<template>
  <v-main>
    <v-container
      class="py-8 px-6 d-flex align-center justify-center h-100">
      <v-card class="pa-8">
        <v-card-title>
          Welcome to Hex-Box!
        </v-card-title>

        <v-card-text>
          Hex-Box is a Nuxt + Electron mail client.
        </v-card-text>

        <v-card-actions>
          <v-btn variant="flat" color="primary" @click="$router.push('/add_account')">Add account</v-btn>
          <v-btn variant="flat" color="primary">Import data</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import { useAccountsStore } from '../stores/accounts';

export default {
  layout: 'no_accounts',
  computed: {
    accounts() {
      return useAccountsStore().accounts;
    },
  },
  mounted() {
    if (this.accounts.length > 0) {
      this.$router.push('/mail/inbox');
    }
  },
};
</script>
