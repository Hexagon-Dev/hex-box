<template>
  <v-container class="py-8 px-6" fluid>
    <v-table>
      <thead>
      <tr>
        <th>Id</th>
        <th>Service</th>
        <th>Email</th>
        <th>Created at</th>
        <th>Actions</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="item in accounts" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ services.find(service => service.id === item.serviceId).name }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.created_at }}</td>
        <td>
          <v-btn icon size="small" class="mr-2"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon size="small"><v-icon>mdi-delete</v-icon></v-btn>
        </td>
      </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<script>
import { useAccountsStore } from '../stores/accounts';
import { useServicesStore } from '../stores/services';

export default {
  computed: {
    accounts() {
      return useAccountsStore().accounts;
    },
    services() {
      return useServicesStore().services;
    },
  },
};
</script>
