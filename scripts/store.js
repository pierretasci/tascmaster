const Vuex = require('vuex');

module.exports = new Vuex.Store({
  state: {
    projects: {
      'project-1' : {
        id: 'project-1',
        name: 'Project 1',
        increments: [],
        elapsed: 0,
        currentStart: new Date().getTime(),
        active: false
      },
    },
    currentTime: new Date().getTime(),
  },
  mutations: {
    addProject: function(state, project) {
      if (typeof project !== 'undefined' && state.projects[project.id]) {
        state.projects[project.id] = project;
      } else {
        return false;
      }
    },

    startTimer: function(state, project_id) {
      if (!project_id || !state.projects[project_id]) {
        return false;
      }

      state.projects[project_id].active = true;
      state.projects[project_id].currentStart = new Date().getTime();
    },

    updateTime: function(state) {
      state.currentTime = new Date().getTime();
    },
  }
});
