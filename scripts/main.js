const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)
const {ipcRenderer} = require('electron');
const store = require('./store');

const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');

// Includes the size of the title bar and the padding around the body.
const BASE_PADDING_PIXELS = 25;
const PIXELS_PER_PROJECT = 38;
const PIXELS_BETWEEN_PROJECTS = 2;

function getWindowHeight(numProjects) {
  return BASE_PADDING_PIXELS +
      ((numProjects + 1) * PIXELS_PER_PROJECT) +
      (numProjects * PIXELS_BETWEEN_PROJECTS);
}

var app = new Vue({
  el: '#app',
  components: {
    'new-project': NewProject,
    'project-item': ProjectItem,
  },
  computed: {
    projects: function() {
      // Update the size of the window.
      let newHeight =
      ipcRenderer.send('updateHeight',
          getWindowHeight(store.state.projects.length));
      return store.state.projects;
    },
  },
  methods: {
    startTimer: function() {
      this.time = Math.trunc((new Date()).getTime() / 1000);

      window.setInterval(() => {
        this.timenow = Math.trunc((new Date()).getTime() / 1000);
      }, 1000);
    },
  },
  store,
});

let ticker = window.setInterval(function() {
  store.commit('updateTime');
}, 1000);
