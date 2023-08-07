<template>
  <v-container class="py-8 px-6" fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-list>
            <template v-for="(email, key) in sortedEmails" :key="key">
              <v-list-item>
                <template v-slot:prepend>
                  <v-checkbox hide-details />
                </template>

                <v-list-item-title>{{ email.title }}</v-list-item-title>

                <v-list-item-subtitle>
                  {{ email.sender }}: {{ email.snippet }}
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
    emailsObj: {
      type: Object,
      required: true,
    },
  },
  computed: {
    emails() {
      switch (this.emailsObj.service) {
        case 'Google':
          const emails = [];

          this.emailsObj.data.forEach(email => emails.push({
            sender: email.payload.headers.find(header => header.name === 'From').value,
            title: email.payload.headers.find(header => header.name === 'Subject').value,
            snippet: email.snippet,
            received_at: email.payload.headers.find(header => header.name === 'Date').value,
          }));

          return emails;
      }
    },
    sortedEmails() {
      return this.emails?.sort(function(a, b) {
        let keyA = new Date(a.received_at);
        let keyB = new Date(b.received_at);

        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
    },
  },
};
</script>
