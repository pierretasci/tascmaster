const Vue = require('Vue');
const Vuex = require('vuex');
const { ipcRenderer } = require('electron');
const CURRENT_TIME = require('../utils/time');
const Helpers = require('./helpers');
const Logger = require('../utils/logger');
const Validator = require('validator');

// == HELPER METHODS ==
let ticker;
const startTicker = function() {
  ticker = window.setInterval(function() {
    store.commit('updateTime');
  }, 100);
}
const clearTicker = function() {
  window.clearInterval(ticker);
  ticker = null;
}

// == STORE ==
const store = new Vuex.Store({
  state: {
    projects: [],
    currentTime: CURRENT_TIME(),
  },
  mutations: {
    /**
     * Takes in payload the project id to add time to and a number of SECONDS to
     * add to the artificial time block of the project. Can be negative but must
     * be a number.
     */
    addArtificialTime: function(state, payload) {
      if (typeof payload !=='object') {
        return Logger.error('addArtificialTime | No payload provided.');
      }

      if (typeof payload.id !== 'string' || Validator.isEmpty(payload.id)) {
        return Logger.error('addArtificialTime | No id provided.');
      }

      if (typeof payload.diff !== 'number') {
        return Logger.error('addArtificialTime | No diff provided.');
      }

      const index = Helpers.findProject(state.projects, payload.id);

      if (index < 0) {
        Logger.warn('addArtificialTime | Could not find project for id ' 
          + payload.id);
      }

      state.projects[index].artificialTime.push(payload.diff);
      persistState(state.projects);
    },
    addProject: function(state, project) {
      if (typeof project !== 'undefined' &&
          Helpers.findProject(state.projects, project.id) === -1) {
        state.projects.push(Helpers.createNewProject(project.id, project.name));

        // Now that we have a new project, persist the new state.
        persistState(state.projects);
      } else {
        Logger.warn('Could not create project');
        return false;
      }
    },

    addAndStartProject: function(state, project) {
      if (typeof project !== 'undefined' &&
          Helpers.findProject(state.projects, project.id) === -1) {
        const newProject = Helpers.createNewProject(project.id, project.name);
        newProject.active = true;
        newProject.currentStart = CURRENT_TIME();
        state.projects.push(newProject);

        // Now that we have a new project, persist the new state.
        persistState(state.projects);

        if (!ticker) {
          startTicker();
        }
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
      const index = Helpers.findProject(state.projects, project_id)
      if (index < 0) {
        return false;
      }

      state.projects[index].active = true;
      state.projects[index].currentStart = CURRENT_TIME();

      persistState(state.projects);
      if (!ticker) {
        startTicker();
      }
    },

    stopTimer: function(state, project_id) {
      const index = Helpers.findProject(state.projects, project_id)
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

      for (const p in state.projects) {
        if (p !== index && state.projects[p].active) {
          return;
        }
      }
      clearTicker();
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
  ipcRenderer.send('newState', Helpers.cleanProjects(
    Helpers.deepCopy(projects)));
}
let persistStateTicker = window.setInterval(() => {
    persistState(store.state.projects);
}, 5000);

// Send a request to load the intial state of the app.
ipcRenderer.once('receiveInitialState', (e, initialState) => {
  store.commit('initializeProjects', initialState);
});
ipcRenderer.send('loadInitialState');
