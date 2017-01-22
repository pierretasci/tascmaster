const CURRENT_TIME = require('../utils/time');
const Formatters = require('./formatters');
const Helpers = require('./helpers');
const Logger = require('../utils/logger');
const Validator = require('validator');
const { ipcRenderer } = require('electron');
const Moment = require('moment-timezone');

module.exports = {
  /**
   * Takes in payload the project id to add time to and a number of SECONDS to
   * add to the artificial time block of the project. Can be negative but must
   * be a number.
   */
  addArtificialTime: function(state, payload) {
    if (typeof payload !=='object') {
      Logger.error('addArtificialTime | No payload provided.');
      return false;
    }

    if (typeof payload.id !== 'string' || Validator.isEmpty(payload.id)) {
      Logger.error('addArtificialTime | No id provided.');
      return false;
    }

    if (typeof payload.diff !== 'number') {
      Logger.error('addArtificialTime | No diff provided.');
      return false;
    }

    const index = Helpers.findProject(state.projects, payload.id);

    if (index < 0) {
      Logger.error('addArtificialTime | Could not find project for id '
        + payload.id);
      return false;
    }

    state.projects[index].artificialTime.push({
      diff: payload.diff,
      timestamp: CURRENT_TIME(),
    });
    Helpers.persistState(state.projects);
  },
  addProject: function(state, project) {
    if (typeof project !== 'object' || typeof project.id !== 'string' ||
        Helpers.findProject(state.projects, project.id) >= 0) {
      Logger.error('addProject | Could not add project.');
      return false;
    }
    state.projects.push(Helpers.createNewProject(project.id, project.name));

    // Now that we have a new project, persist the new state.
    Helpers.persistState(state.projects);
  },

  addAndStartProject: function(state, payload) {
    const data = Object.assign({}, { overrideStart: true }, payload);
    const project = data.project;
    const overrideStart = data.overrideStart;

    if (typeof project !== 'object' || typeof project.id !== 'string' ||
        Helpers.findProject(state.projects, project.id) >= 0) {
      Logger.error('addAndStartProject | No project defined.');
      return false;
    }

    if (overrideStart) {
      state.projects = Helpers.deactivateAll(state.projects);
    }

    const newProject = Helpers.createNewProject(project.id, project.name);
    newProject.active = true;
    newProject.currentStart = CURRENT_TIME();
    state.projects.push(newProject);

    // Now that we have a new project, persist the new state.
    Helpers.persistState(state.projects);
  },

  clearProjects: function(state) {
    state.projects = [];
    Helpers.persistState(state.projects);
  },

  export: function(state, payload) {
    if (typeof payload !== 'object' || typeof payload.type !== 'string') {
      Logger.error('No type provided.');
      return false;
    }

    const projects = Helpers.deactivateAll(Helpers.deepCopy(state.projects));
    let formattedData = [];
    switch(payload.type) {
      case 'SS':
        formattedData = Formatters.SS(projects);
        break;
      case 'D':
        formattedData = Formatters.D(projects);
        break;
      default:
        Logger.error('Incorrect type. Could not parse using: ' + payload.type);
        return false;
    }

    ipcRenderer.send('export', {
      data: formattedData,
    });
  },

  initializeProjects: function(state, newProjects) {
    state.projects = newProjects;
  },

  startTimer: function(state, payload) {
    const data = Object.assign({}, { overrideStart: true }, payload);
    Logger.info('Start Timer: ' + JSON.stringify(data));

    const index = Helpers.findProject(state.projects, data.id)
    if (index < 0) {
      Logger.error('startTimer | Could not find requested project to start.');
      return false;
    }

    if (data.overrideStart) {
      state.projects = Helpers.deactivateAll(state.projects);
    }

    state.projects[index].active = true;
    state.projects[index].currentStart = CURRENT_TIME();

    Helpers.persistState(state.projects);
  },

  sendToast: function(state, message) {
    console.log('Send Toast');
    state.toaster = message;
    setTimeout(() => {
      state.toaster = '';
    }, 1500);
  },

  stopTimer: function(state, payload) {
    const data = Object.assign({}, payload);

    const index = Helpers.findProject(state.projects, data.id)
    if (index < 0) {
      return false;
    }

    state.projects = Helpers.deactivateAll(state.projects, data.id);
    Helpers.persistState(state.projects);
  },

  updateTime: function(state) {
    state.currentTime = CURRENT_TIME();
  },
};
