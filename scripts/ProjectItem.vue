<template lang="pug">
  .line.project
    .name {{project.name}}
    .running {{prettyTime}}
    .start(v-if="!project.active")
      button(type="button",@click="start").btn.primary Start
    .stop(v-if="project.active")
      button(type="button",@click="stop").btn.primary Stop
</template>

<script>
const SEC_PER_MINUTE = 60;
const SEC_PER_HOUR = SEC_PER_MINUTE * 60;
const SEC_PER_DAY = SEC_PER_HOUR * 24;

module.exports = {
  computed: {
    prettyTime: function() {
      let duration = this.displayTime;
      console.log(duration);
      const components = [];
      let hours = Math.floor(duration / SEC_PER_HOUR);
      components.push(hours < 10 ? '0' + hours : hours);
      duration %= SEC_PER_HOUR;

      let minutes = Math.floor(duration / SEC_PER_MINUTE);
      components.push(minutes < 10 ? '0' + minutes : minutes);
      duration %= SEC_PER_MINUTE;

      let sec = Math.round(duration);
      components.push(sec < 10 ? '0' + sec : sec);

      return components.join(':');
    },
    displayTime: function() {
      // If we are active show the running time, otherwise the elapsed time.
      if (this.project.active) {
        if (this.project.currentStart < 0) {
          return 0;
        }
        const diff = Math.round((
            this.$store.state.currentTime - this.project.currentStart)/1000);
        return Math.max(0, diff);
      } else {
        return Math.round(this.project.increments.reduce((runningTotal, icr) => {
          return runningTotal + (icr.end - icr.start);
        }, 0)/1000);
      }
    },
    shouldShowElapsedTime: function() {
      return !this.project.active && this.project.increments.length > 0;
    }
  },
  methods: {
    start: function() {
      this.$store.commit('startTimer', this.project.id);
    },
    stop: function() {
      this.$store.commit('stopTimer', this.project.id);
    }
  },
  props: ['project']
};
</script>
