const Vue = require('vue');

var app = new Vue({
  el: '#app',
  data: {
    time: -1,
    timenow: Math.trunc((new Date()).getTime() / 1000),
  },
  computed: {
    elapsed: function() {
      if (this.time < 0) {
        return null;
      }
      return this.timenow - this.time;
    },
  },
  methods: {
    startTimer: function() {
      this.time = Math.trunc((new Date()).getTime() / 1000);

      window.setInterval(() => {
        this.timenow = Math.trunc((new Date()).getTime() / 1000);
      }, 1000);
    },
  },
});
