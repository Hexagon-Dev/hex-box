<template>
  <v-container class="py-8 px-6" fluid>
    {{ tab }}

    <v-row>
      <v-col>
        <v-card>
          <v-list>
            <template v-for="email in sortedEmails" :key="email.headers['message-id'].at(0)">
              <v-list-item>
                <template v-slot:prepend>
                  <v-checkbox hide-details />
                </template>

                <v-list-item-title>{{ email.headers.from.at(0) }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ email.headers.subject.at(0) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-divider />
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
    emails: {
      type: Array,
      required: true,
    },
  },
  computed: {
    sortedEmails() {
      console.log(this.emails)
      return this.emails?.sort(function(a, b) {
        let keyA = new Date(a.headers.date.at(0));
        let keyB = new Date(b.headers.date.at(0));

        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
    },
  },
};
</script>
