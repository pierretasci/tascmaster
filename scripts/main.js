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
const MENU_HEIGHT = 29;
const PIXELS_PER_PROJECT = 32;

function getWindowHeight(numProjects) {
  if (numProjects === 0) {
    return MENU_HEIGHT + PIXELS_PER_PROJECT;
  }
  // return ((numProjects + 1) * PIXELS_PER_PROJECT) + MENU_HEIGHT;
  const body = document.body;
  const html = document.documentElement;
  return Math.max(body.offsetHeight, html.clientHeight, html.offsetHeight);
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
      setTimeout(() => {
        const newHeight = getWindowHeight(newProjects.length || 0);
        Logger.info('Updating height to ' + newHeight);
        ipcRenderer.send('updateHeight', newHeight);
      }, 15);
    }
  }
});
