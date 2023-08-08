<template>
  <v-main>
    <v-container class="py-8 px-6 d-flex align-center justify-center h-100">
      <v-card class="pa-8" style="width: 400px;">
        <v-card-title class="text-center mb-4">
          Add account
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-autocomplete
              class="pb-2"
              v-model="account.serviceId"
              label="Service"
              variant="outlined"
              :items="services"
              item-title="name"
              item-value="id"
              :rules="[rules.required]"
            />

            <v-btn v-if="account.serviceId === 1" block color="primary" @click="addGoogleAccount">
              Authorize with Google
            </v-btn>

            <template v-else>
              <v-text-field
                class="pb-2"
                v-model="account.email"
                label="Email"
                variant="outlined"
                type="email"
                :rules="[rules.required, rules.email]"
                maxlength="255"
              />

              <v-text-field
                class="pb-2"
                v-model="account.password"
                label="Password"
                variant="outlined"
                :type="isPasswordVisible ? 'text' : 'password'"
                :rules="[rules.required]"
                maxlength="255"
              >
                <template #append>
                  <v-btn @click="isPasswordVisible = !isPasswordVisible" variant="flat" size="small" icon>
                    <v-icon v-if="!isPasswordVisible">mdi-eye</v-icon>
                    <v-icon v-else>mdi-eye-off</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </template>
          </v-form>
        </v-card-text>

        <v-card-actions class="d-flex justify-space-between w-100 px-4" v-if="account.serviceId !== 1">
          <v-btn variant="flat" color="primary" @click="$router.push('/')">
            Cancel
          </v-btn>

          <v-btn variant="flat" color="primary" @click="addAccount">
            Add account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
const { ipcRenderer } = window.require('electron');

import { useAccountsStore } from '../stores/accounts';
import { useModalStore } from '../stores/modal';
import { useServicesStore } from '../stores/services';
import validation from '../mixins/validation';

export default {
  mixins: [validation],
  data() {
    return {
      isPasswordVisible: false,
      account: {
        email: '',
        password: '',
        serviceId: null,
      },
    };
  },
  computed: {
    accountsStore() {
      return useAccountsStore();
    },
    modalStore() {
      return useModalStore();
    },
    servicesStore() {
      return useServicesStore();
    },
    services() {
      return this.servicesStore.services;
    },
  },
  methods: {
    async addAccount() {
      if (!(await this.$refs.form.validate()).valid) {
        return;
      }

      const account = this.accountsStore.addAccount(this.account);

      if (this.accountsStore.currentAccountId === null) {
        this.accountsStore.setCurrentAccountId(account.id);
      }

      this.modalStore.show(
        'Add account',
        'Account was successfully added.',
        [{
          text: 'OK', click: () => {
            this.modalStore.close();
            this.$router.push('mail');
          }
        }],
      );
    },
    addGoogleAccount() {
      ipcRenderer.send('authGoogle');

      ipcRenderer.on('authGoogleFinish', () => {
        ipcRenderer.send('fetchGoogleProfile');
      });

      ipcRenderer.on('fetchGoogleProfileFinish', (event, response) => {
        this.account.email = response.data.emailAddress;

        const account = this.accountsStore.addAccount(this.account);

        if (this.accountsStore.currentAccountId === null) {
          this.accountsStore.setCurrentAccountId(account.id);
        }

        this.$router.push('/mail/inbox');
      });

      ipcRenderer.on('authGoogleCodeExchangeFinish', (event, response) => {
        this.account.email = response.data.emailAddress;

        const account = this.accountsStore.addAccount(this.account);

        if (this.accountsStore.currentAccountId === null) {
          this.accountsStore.setCurrentAccountId(account.id);
        }

        this.$router.push('/mail/inbox');
      });
    },
  },
};
</script>
