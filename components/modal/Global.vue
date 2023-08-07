<template>
  <ModalDefault :is-active="modal.isActive" class="fixed top-0 left-0 w-sm-50 w-75">
    <template #header>
      {{ modal.title }}
    </template>

    <template #content>
      {{ modal.content }}
    </template>

    <template #actions>
      <div class="d-flex justify-center w-100">
        <v-btn variant="flat" color="primary" v-for="button in modal.actions" @click="button.click">
          {{ button.text }}
        </v-btn>
      </div>
    </template>
  </ModalDefault>
</template>

<script>
import { useModalStore } from '../../stores/modal';

export default {
  computed: {
    modal() {
      return useModalStore().modal;
    }
  }
}
</script>

