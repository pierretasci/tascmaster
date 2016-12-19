const Vue = require('Vue');
const Vuex = require('vuex');

const CURRENT_TIME = function() {
  return new Date().getTime();
}

const findProject = function(arr, id) {
  if (!id) {
    return  -1;
  }

  for(let i = 0; i < arr.length; ++i) {
    if (arr[i].id === id) {
      return i;
    }
  }
  return -1;
}

module.exports = new Vuex.Store({
  state: {
    projects: [
      {
        id: 'project-1',
        name: 'Project 1',
        increments: [],
        elapsed: 0,
        currentStart: CURRENT_TIME(),
        active: false
      },
    ],
    currentTime: CURRENT_TIME(),
  },
  mutations: {
    addProject: function(state, project) {
      if (typeof project !== 'undefined') {
        state.projects.push({
          id: project.id,
          name: project.name,
          increments: [],
          currentStart: -1,
          active: false,
        });
      } else {
        return false;
      }
    },

    startTimer: function(state, project_id) {
      const index = findProject(state.projects, project_id)
      if (index < 0) {
        return false;
      }

      state.projects[index].active = true;
      state.projects[index].currentStart = CURRENT_TIME();
    },

    stopTimer: function(state, project_id) {
      const index = findProject(state.projects, project_id)
      if (index < 0) {
        return false;
      }

      const stopTime = CURRENT_TIME();

      state.projects[index].active = false;
      // Save this interval to the increments.
      state.projects[index].increments.push({
        start: state.projects[index].currentStart,
        end: stopTime,
      });
    },

    updateTime: function(state) {
      state.currentTime = CURRENT_TIME();
    },
  }
});
