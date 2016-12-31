const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)
const { ipcRenderer, remote } = require('electron');
const Logger = require('./utils/logger');
const Menu = require('./menu');
const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');
const store = require('./store');

// Includes the size of the title bar and the padding around the body.
const PIXELS_PER_PROJECT = 37;

function getWindowHeight(numProjects) {
  return (numProjects + 1) * PIXELS_PER_PROJECT;
}

var app = new Vue({
  el: '#app',
  components: {
    'new-project': NewProject,
    'project-item': ProjectItem,
  },
  computed: {
    projects: function() {
      return store.state.projects;
    },
  },
  store,
  watch: {
    projects: function(newProjects) {
      const newHeight = getWindowHeight(newProjects.length || 0);
      Logger.info('Updating height to ' + newHeight);
      ipcRenderer.send('updateHeight', newHeight);
    }
  }
});
