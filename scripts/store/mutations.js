const CURRENT_TIME = require('../utils/time');
const Helpers = require('./helpers');
const Logger = require('../utils/logger');
const Validator = require('validator');

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

    state.projects[index].artificialTime.push(payload.diff);
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

  initializeProjects: function(state, newProjects) {
    state.projects = newProjects;
  },

  startTimer: function(state, payload) {
    const data = Object.assign({}, { overrideStart: true }, payload);
    Logger.info('Start Timer: ' + JSON.stringify(data));

    const index = Helpers.findProject(state.projects, data.id)
    if (index < 0) {
      return false;
    }

    if (data.overrideStart) {
      state.projects = Helpers.deactivateAll(state.projects);
    }

    state.projects[index].active = true;
    state.projects[index].currentStart = CURRENT_TIME();

    Helpers.persistState(state.projects);
  },

  stopTimer: function(state, payload) {
    const data = Object.assign({}, payload);

    const index = Helpers.findProject(state.projects, data.id)
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

    Helpers.persistState(state.projects);
  },

  updateTime: function(state) {
    state.currentTime = CURRENT_TIME();
  },
};
