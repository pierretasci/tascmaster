<template lang="pug">
  .line.project
    .name {{project.name}}
    .editable(v-if="editing")
      input(type="text",v-model="hours").inline
      .
        :
      input(type="text",v-model="minutes").inline
      .
        :
      input(type="text",v-model="seconds").inline
    .running(v-if="!editing",v-on:click="editTime") {{prettyTime}}
    template(v-if="!editing")
      .start(v-if="!project.active")
        button(
          type="button",
          v-if="platform === 'darwin'",
          @click.meta="backgroundStart",
          @click="start").btn.image.play
        button(
          type="button",
          v-if="platform !== 'darwin'",
          @click.ctrl="backgroundStart",
          @click="start").btn.image.play
      .stop(v-if="project.active")
        button(type="button",@click="stop").btn.image.pause
    template(v-if="editing")
      button(type="button",@click="save").btn.image.save
      button(type="button",@click="cancel").btn.image.cancel
</template>

<script>
const SEC_PER_MINUTE = 60;
const SEC_PER_HOUR = SEC_PER_MINUTE * 60;
const SEC_PER_DAY = SEC_PER_HOUR * 24;

module.exports = {
  data: function() {
    return {
      editing: false,
      hours: '00',
      minutes: '00',
      seconds: '00',
      platform: process.platform,
    };
  },
  computed: {
    /**
     * Takes in a number of seconds. Pretty prints that number of seconds as a
     * HH:MM:SS string.
     */
    prettyTime: function() {
      let duration = this.displayTime;
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

    /**
     * Returns the correct number of seconds to display for this project. If the
     * project is not active, simply adds up all of the saved increments as well
     * as all of the overrides.
     *
     * It the project is active, then throws in the current running time.
     */
    displayTime: function() {
      // If we are not active, show the elapsed time. Otherwise, add in the
      // running time.
      const artificialTime = this.project.artificialTime.reduce((a, b) => a + b, 0);
      const elapsedTime = Math.round(
        this.project.increments.reduce((runningTotal, icr) => {
          return runningTotal + (icr.end - icr.start);
        }, 0)/1000);
      const totalElapsed = elapsedTime + artificialTime;

      // If this project is not active, just return the elapsed time.
      if (!this.project.active) {
        return totalElapsed;
      }

      const diff = Math.round((
          this.$store.state.currentTime - this.project.currentStart)/1000);
      return totalElapsed + Math.max(0, diff);
    },
  },
  methods: {
    backgroundStart: function() {
      this.$store.commit('startTimer', {
        id: this.project.id,
        overrideStart: false
      });
    },
    cancel: function() {
      this.editing = false;
    },
    editTime: function() {
      if (!this.project.active) {
        this.editing = true;

        // Setup the individual units to show.
        const components = this.prettyTime.split(':');
        this.hours = components[0];
        this.minutes = components[1];
        this.seconds = components[2];
      }
    },
    save: function() {
      // Validate that all the inputs are numbers.
      const hours = parseInt(this.hours);
      const minutes = parseInt(this.minutes);
      const seconds = parseInt(this.seconds);

      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        alert("Please only enter numbers.");
        return;
      }

      this.editing = false;
      // Add an artificial increment to bring the elapsed time up to a correct
      // amount.
      this.$store.commit('addArtificialTime', {
        id: this.project.id,
        diff: hours * SEC_PER_HOUR
          + minutes * SEC_PER_MINUTE
          + seconds
          - this.displayTime,
      });
    },
    start: function(e) {
      if (!e.metaKey && !e.ctrlKey) {
        this.$store.commit('startTimer', { id: this.project.id });
      }
    },
    stop: function() {
      this.$store.commit('stopTimer', { id: this.project.id });
    },
  },
  props: ['project']
};
</script>
