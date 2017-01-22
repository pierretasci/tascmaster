<template lang="pug">
  .menu-bar
    .menu
      .item
        .title Export
        .submenu
          .option(v-on:click="exportSS") Start and Stop Times
            .subtitle Each period of work (or manual time entry) becomes a row.
          .option(v-on:click="exportD") Duration
            .subtitle Projects are listed with total duration per day.
      .item
        .title Actions
        .submenu
            .option(v-on:click="clearAllProjects") Clear All Projects
    .close
      button.btn.image.cancel.white(@click="close")
</template>

<script>
const Logger = require('./utils/logger');
const { ipcRenderer } = require('electron');

module.exports = {
  methods: {
    clearAllProjects: function() {
      Logger.info('requested to clear all projects');
      this.$store.commit('clearProjects');
    },

    close: function() {
      ipcRenderer.send('close');
    },

    exportSS: function() {
      Logger.info('exporting projects to csv stop and start');
      this.$store.commit('export', {
        type: 'SS'
      });
    },

    exportD: function() {
      Logger.info('exporting projects to csv durations');
      this.$store.commit('export', {
        type: 'D'
      });
    }
  }
};
</script>
