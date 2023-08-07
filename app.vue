<template>
  <NuxtLayout>
    <v-app>
      <NuxtPage/>
    </v-app>
  </NuxtLayout>
</template>

<script>
export default {
  async mounted() {
    const url = new URL(document.location.href);

    const query = {};

    url.searchParams.forEach((value, key) => query[key] = value)

    // This is very bad, however it fixes bug with Google oauth redirect
    await this.$router.push({path: url.pathname, query: query})
  }
}
</script>

<style>
html {
  overflow-y: auto;
}
</style>