<template>
  <v-main>
    <h1>Authorizing google...</h1>
  </v-main>
</template>

<script>
const { ipcRenderer } = window.require('electron');

export default {
  layout: 'no_accounts',
  mounted() {
    ipcRenderer.send('authGoogleCodeExchange', this.$route.query);

    ipcRenderer.on('authGoogleCodeExchangeFinish', (event, response) => {
      if (response.success === false) {
        console.error(response.error);

        return;
      }

      ipcRenderer.send('authGoogleCodeExchangeClose');
    });
  },
};
</script>
