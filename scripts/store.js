const Vue = require('Vue');
const Vuex = require('vuex');
const { ipcRenderer } = require('electron');
const CURRENT_TIME = require('./time');

// == HELPER METHODS ==
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

// Returns a better view of the projects for use in persisting them to disk.
function cleanProjects(projects) {
  return projects.map(function(p) {
    if (p.active) {
      p.increments.push({
        start: p.currentStart,
        end: CURRENT_TIME()
      });
    }
    // When we persist the project, we always set it's active status time as
    // false.
    p.active = false
    p.currentStart = -1;
    return p;
  });
}

function deepCopy(a) {
  return JSON.parse(JSON.stringify(a));
}

// == STORE ==
const store = new Vuex.Store({
  state: {
    projects: [],
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

        // Now that we have a new project, persist the new state.
        persistState(state.projects);
      } else {
        return false;
      }
    },

    clearProjects: function(state) {
      state.projects = [];
      persistState(state.projects);
    },

    initializeProjects: function(state, newProjects) {
      state.projects = newProjects;
    },

    startTimer: function(state, project_id) {
      const index = findProject(state.projects, project_id)
      if (index < 0) {
        return false;
      }

      state.projects[index].active = true;
      state.projects[index].currentStart = CURRENT_TIME();

      persistState(state.projects);
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

      persistState(state.projects);
    },

    updateTime: function(state) {
      state.currentTime = CURRENT_TIME();
    },
  }
});
module.exports = store;

// == RUNNABLE ==
// Start an interval to periodically persist the state.
const persistState = function(projects) {
  ipcRenderer.send('newState', cleanProjects(deepCopy(projects)));
}
// let persistStateTicker = window.setInterval(() =>
//     persistState(store.state.projects), 5000);

// Send a request to load the intial state of the app.
ipcRenderer.once('receiveInitialState', (e, initialState) => {
  store.commit('initializeProjects', initialState);
});
ipcRenderer.send('loadInitialState');
