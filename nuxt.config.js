// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        'nuxt-electron',
        '@invictus.codes/nuxt-vuetify',
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt',
    ],
    electron: {
        build: [
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/main.js',
            },
            {
                entry: 'electron/preload.js',
                onstart(options) {
                    // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                    // instead of restarting the entire Electron App.
                    options.reload()
                },
            },
        ],
        renderer: {},
    },
    vuetify: {
        /* vuetify options */
        vuetifyOptions: {
            theme: {
                defaultTheme: 'dark',
                themes: {
                    dark: {
                        colors: {
                            primary: 'rgb(67 56 202)',
                            secondary: 'rgb(55 48 163)',
                        }
                    },
                },
            }
        },

        moduleOptions: {
            /* nuxt-vuetify module options */
            treeshaking: true,
            useIconCDN: true,

            /* vite-plugin-vuetify options */
            styles: true,
            autoImport: true,
        }
    },
    piniaPersistedstate: {
        storage: 'localStorage'
    },
});
