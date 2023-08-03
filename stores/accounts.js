import { defineStore } from 'pinia'

export const useAccountsStore = defineStore('accounts', {
    state: () => ({
        accounts: [],
        currentAccountId: null,
    }),
    getters: {
        getCurrentAccount: (state) => state.accounts.find(account => account.id === state.currentAccountId),
    },
    actions: {
        addAccount(account) {
            account.id = this.accounts.length ?? 1;
            account.created_at = new Date().toISOString().slice(0, 10);

            this.accounts.push(account);

            return account;
        },
        setCurrentAccountId(accountId) {
            this.currentAccountId = accountId;
        }
    },
    persist: true,
});
