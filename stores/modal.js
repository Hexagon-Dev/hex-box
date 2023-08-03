import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', {
    state: () => ({
        modal: {
            isActive: false,
            title: '',
            content: '',
            actions: [],
        },
    }),
    actions: {
        show(title, content, actions) {
            this.modal = { isActive: true, title, content, actions };
        },
        close() {
            this.modal.isActive = false;
        }
    },
});
