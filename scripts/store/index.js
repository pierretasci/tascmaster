const Vue = require('Vue');
const Vuex = require('vuex');
const { ipcRenderer } = require('electron');
const CURRENT_TIME = require('../utils/time');
const Helpers = require('./helpers');

// == HELPER METHODS ==
let ticker;
ticker = window.setInterval(function() {
  store.commit('updateTime');
}, 100);

// == STORE ==
const store = new Vuex.Store({
  state: {
    projects: [],
    currentTime: CURRENT_TIME(),
  },
  mutations: require('./mutations'),
});
module.exports = store;

// == RUNNABLE ==
let persistStateTicker = window.setInterval(() => {
    Helpers.persistState(store.state.projects);
}, 5000);

// Send a request to load the intial state of the app.
ipcRenderer.once('receiveInitialState', (e, initialState) => {
  store.commit('initializeProjects', initialState);
});
ipcRenderer.send('loadInitialState');
