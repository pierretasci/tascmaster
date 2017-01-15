<template lang="pug">
  transition(
      name="toasterAnimation")
    .toast(v-if="popToaster") {{ toast }}
</template>

<script>
const Validator = require('validator');

module.exports = {
  computed: {
    popToaster: function() {
      console.log('Toast?');
      return typeof this.toast === 'string' &&
          !Validator.isEmpty(this.toast);
    },

    toast: function() {
      return this.$store.state.toaster;
    }
  },
  methods: {
    handle: function() {
      this.$store.commit('sendToast', 'message');
    }
  },
};
</script>