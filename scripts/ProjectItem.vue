<template lang="pug">
  .line.project
    .name {{project.name}}
    .running(v-if="project.active") {{prettyRunningTime}}
    .elapsed(v-if="shouldShowElapsedTime") {{elapsedTime}}
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
    elapsedTime: function() {
      let time_spent = 0;
      this.project.increments.map((incr) => {
        time_spent += incr.end - incr.start;
      });
      time_spent = Math.round(time_spent/1000);

      // Pretty print the elpased time.
      const components = [];
      if (time_spent >= SEC_PER_DAY) {
        const days = Math.floor(time_spent / SEC_PER_DAY);
        components.push(days + ' day' + (days > 1 ? 's' : ''));
        time_spent %= SEC_PER_DAY;
      }

      if (time_spent >= SEC_PER_HOUR) {
        const hours = Math.floor(time_spent / SEC_PER_HOUR);
        components.push(hours + ' hr' + (hours > 1 ? 's' : ''));
        time_spent %= SEC_PER_HOUR;
      }

      if (time_spent >= SEC_PER_MINUTE) {
        const minutes = Math.floor(time_spent / SEC_PER_MINUTE);
        components.push(minutes + ' min' + (minutes > 1 ? 's' : ''));
        time_spent %= SEC_PER_MINUTE;
      }

      if (time_spent > 0) {
        components.push(time_spent + ' sec' + (time_spent > 1 ? 's' : ''));
      }

      // We only want to show the largest two orders of units.This will delete
      // all elements at index 2 up to the end. If there aren't that many
      // components, then it will simply do nothing.
      components.splice(2);
      return components.join(' ');
    },
    prettyRunningTime: function() {
      let duration = this.runningTime;
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
    runningTime: function() {
      let diff = Math.round((
          this.$store.state.currentTime - this.project.currentStart)/1000);
      return Math.max(0,diff);
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
