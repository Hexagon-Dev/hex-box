<template>
  <v-dialog v-model="active" width="auto">
    <slot>
      <v-card>
        <v-card-title class="d-flex">
          <slot name="header" />
        </v-card-title>

        <v-card-text>
          <slot name="content" />
        </v-card-text>

        <v-card-actions>
          <slot name="actions" />
        </v-card-actions>
      </v-card>
    </slot>
  </v-dialog>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    active: {
      get() {
        return this.isActive;
      },
      set(value) {
        this.$emit('update:isActive', value);
      },
    },
  },
};
</script>
