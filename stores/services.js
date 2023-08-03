import { defineStore } from 'pinia';

export const useServicesStore = defineStore('services', {
    state: () => ({
        services: [
            {
                id: 1,
                name: 'Google',
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
            },
        ],
    }),
    actions: {
        addService(service) {
            service.id = this.services.length ?? 1;

            this.services.push(service);
        },
    },
    persist: true,
});
