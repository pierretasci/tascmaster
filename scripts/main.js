const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)
const {ipcRenderer} = require('electron');
const store = require('./store');
const CURRENT_TIME = require('./time');

const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');

// Includes the size of the title bar and the padding around the body.
const BASE_PADDING_PIXELS = 25;
const PIXELS_PER_PROJECT = 38;
const PIXELS_BETWEEN_PROJECTS = 2;

function getWindowHeight(numProjects) {
  let nHeight = BASE_PADDING_PIXELS;
  console.log(nHeight);
  nHeight += (numProjects + 1) * PIXELS_PER_PROJECT;
  console.log(nHeight);
  nHeight += numProjects * PIXELS_BETWEEN_PROJECTS;
  console.log(nHeight);
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
      // Update the size of the window.
      const projects = store.state.projects || [];
      const newHeight = getWindowHeight(projects.length);
      console.log('Updating height to ' + newHeight);
      ipcRenderer.send('updateHeight', newHeight);

      return projects;
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

// == Initialization ==

let ticker = window.setInterval(function() {
  store.commit('updateTime');
}, 1000);
