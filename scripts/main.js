const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)
const {ipcRenderer} = require('electron');
const Logger = require('./utils/logger');
const menu = require('./menu');
const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');
const store = require('./store');

// Includes the size of the title bar and the padding around the body.
const BASE_PADDING_PIXELS = 16;
const PIXELS_PER_PROJECT = 31;
const PIXELS_BETWEEN_PROJECTS = 8;

function getWindowHeight(numProjects) {
  let nHeight = BASE_PADDING_PIXELS;
  nHeight += (numProjects + 1) * PIXELS_PER_PROJECT;
  nHeight += numProjects * PIXELS_BETWEEN_PROJECTS;
  return nHeight;
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
