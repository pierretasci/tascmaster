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
        button(type="button",@click="start").btn.primary Start
      .stop(v-if="project.active")
        button(type="button",@click="stop").btn.primary Stop
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
    };
  },
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
        const artificialTime = this.project.artificialTime.reduce((a, b) => a + b, 0);
        const elapsedTime =  Math.round(this.project.increments.reduce((runningTotal, icr) => {
          return runningTotal + (icr.end - icr.start);
        }, 0)/1000);
        return elapsedTime + artificialTime;
      }
    },
    shouldShowElapsedTime: function() {
      return !this.project.active && this.project.increments.length > 0;
    }
  },
  methods: {
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
      console.log(this.project);
      this.$store.commit('addArtificialTime', {
        id: this.project.id,
        diff: hours * 3600 + minutes * 60 + seconds - this.displayTime,
      });
    },
    start: function() {
      this.$store.commit('startTimer', this.project.id);
    },
    stop: function() {
      this.$store.commit('stopTimer', this.project.id);
    },
  },
  props: ['project']
};
</script>
