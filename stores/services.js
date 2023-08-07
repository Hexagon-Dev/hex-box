import { defineStore } from 'pinia';

export const useServicesStore = defineStore('services', {
    state: () => ({
        services: [
            {
                id: 1,
                name: 'Google',
                external: true,
            },
            {
                id: 2,
                name: 'Meta.ua',
                host: 'pop.meta.ua',
                port: 995,
                tls: true,
            },
        ],
    }),
    getters: {
        getServiceById: (state) => (id) => state.services.find(service => service.id === id),
    },
    actions: {
        addService(service) {
            service.id = this.services.length ?? 1;

            this.services.push(service);
        },
    },
});
