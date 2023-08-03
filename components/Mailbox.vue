<template>
  <v-container class="py-8 px-6" fluid>
    {{tab}}

    <v-row>
      <v-col v-for="card in cards" :key="card" cols="12">
        <v-card>
          <v-list>
            <v-list-subheader>{{ card }}</v-list-subheader>
            <template v-for="n in 6" :key="n">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="grey-darken-1"></v-avatar>
                </template>

                <v-list-item-title>Message {{ n }}</v-list-item-title>

                <v-list-item-subtitle>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil repellendus distinctio similique
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider v-if="n !== 6" :key="`divider-${n}`" inset />
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    tab: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      cards: ['Today', 'Yesterday'],
    };
  },
};
</script>
