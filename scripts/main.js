const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)
const { ipcRenderer, remote } = require('electron');
const Logger = require('./utils/logger');
const MenuBar = require('./MenuBar.vue');
const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');
const store = require('./store');
const Toast = require('./Toast.vue');

// Includes the size of the title bar and the padding around the body.
const MENU_HEIGHT = 20;
const PIXELS_PER_PROJECT = 37;

function getWindowHeight(numProjects) {
  return ((numProjects + 1) * PIXELS_PER_PROJECT) + MENU_HEIGHT;
}

var app = new Vue({
  el: '#app',
  components: {
    'new-project': NewProject,
    'project-item': ProjectItem,
    'menu-bar': MenuBar,
    'toast': Toast,
  },
  computed: {
    projects: function() {
      return store.state.projects;
    },
  },
  data: {
    platform: process.platform,
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
