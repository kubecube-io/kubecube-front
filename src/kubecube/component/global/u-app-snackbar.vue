<template>
  <v-snackbar
    v-model="show"
    :timeout="timeout"
    :color="color"
    top
  >
    {{ message }}

    <template #action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
    data () {
        return {
            show: false,
            message: '',
            color: '',
            timeout: 2000,
        };
    },

    created () {
        this.$store.subscribe((mutation, state) => {
            if (mutation.type === 'snackbar/SHOW_MESSAGE') {
                this.message = state.snackbar.content;
                this.color = state.snackbar.color;
                this.show = true;
            }
        });
    }
};
</script>