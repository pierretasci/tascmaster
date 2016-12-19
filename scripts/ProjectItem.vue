<template lang="pug">
  .line.project
    .name {{project.name}}
    .elapsed(v-if="project.active") {{elapsedTime}}
    .start(v-if="!project.active")
      button(type="button",@click="start").btn.primary Start
    .stop(v-if="project.active")
      button(type="button",@click="stop").btn.primary Stop
</template>

<script>
module.exports = {
  computed: {
    elapsed: function() {
      let diff = Math.floor(
          this.$store.state.currentTime - this.project.currentStart)/1000;
      return diff < 0 ? 0 : diff;
    },
    elapsedTime: function() {
      let duration = this.elapsed;
      let components = [];
      let hours = Math.floor(duration / 3600);
      components.push(hours < 10 ? '0' + hours : hours);
      duration %= 3600;

      let minutes = Math.floor(duration / 60);
      components.push(minutes < 10 ? '0' + minutes : minutes);
      duration %= 60;

      let sec = Math.round(duration);
      components.push(sec < 10 ? '0' + sec : sec);

      return components.join(':');
    },
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
