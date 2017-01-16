<template lang="pug">
  .menu-bar
    .menu
      .item
        .title Export
        .submenu
          .option(v-on:click="exportToCSVSS") CSV - Start and Stop Times
            .subtitle Each period of work (or manual time entry) becomes a row.
          .option(v-on:click="exportToCSVD") CSV - Duration
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

    exportToCSVSS: function() {
      Logger.info('exporting projects to csv stop and start');
      this.$store.commit('exportToCsv', {
        type: 'SS'
      });
    },

    exportToCSVD: function() {
      Logger.info('exporting projects to csv durations');
      this.$store.commit('exportToCsv', {
        type: 'D'
      });
    }
  }
};
</script>
