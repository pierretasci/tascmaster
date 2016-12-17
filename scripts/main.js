const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex)

const store = require('./store');

const NewProject = require('./NewProject.vue');
const ProjectItem = require('./ProjectItem.vue');

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
