const CURRENT_TIME = require('../utils/time');
const Helpers = require('./helpers');
const Logger = require('../utils/logger');
const Validator = require('validator');
const { ipcRenderer } = require('electron');
const Moment = require('moment-timezone');

/**
 * Formats the projects in a flat format where each start/stop time in the
 * project receives its own entry. Also, each artificalTime in the project gets
 * an entry as well.
 */
const formatSS = function(projects) {
  // We need to flatten each of the increments into it's own row, then
  // format the time segments in the user's local time.
  const formattedData = [];
  const FORMAT_STRING = 'MM/DD/YYYY hh:mm:ss.SSS A z';
  const USER_TZ = Moment.tz.guess();
  projects.forEach((p) => {
    if (p.increments.length === 0 && p.artificialTime.length === 0) {
      formattedData.push({ name: p.name });
      return;
    }

    if (p.increments.length > 0) {
      p.increments.forEach((i) => {
        formattedData.push({
          name: p.name,
          start: Moment.tz(i.start, USER_TZ).format(FORMAT_STRING),
          end: Moment.tz(i.end, USER_TZ).format(FORMAT_STRING),
        });
      });
    }

    if (p.artificialTime.length > 0) {
      p.artificialTime.forEach((a) => {
        formattedData.push({
          name: p.name,
          end: Moment.tz(a.timestamp, USER_TZ).format(FORMAT_STRING),
          manual: a.diff,
        });
      });
    }
  });
  return formattedData;
}

/**
 * Formats the projects where the total time spent working on a project for a
 * given day is output. Artificial time is added seperately.
 */
const formatD = function(projects) {
  const formattedData = [];
  const USER_TIMEZONE = Moment.tz.guess();
  const DATE_FORMAT = 'MM/DD/YYYY';
  projects.forEach((p) => {
    if (p.increments.length === 0 && p.artificialTime.length === 0) {
      formattedData.push({
        name: p.name,
      });
      return;
    }

    const all_intervals = (p.increments || [])
      .concat(p.artificialTime)
      .map((a) => {
        if (a.hasOwnProperty('diff')) {
          return {
            diff: a.diff * 1000,
            timestamp: a.timestamp
          };
        }

        return {
          diff: a.end - a.start,
          timestamp: a.end,
        };
      })
      .sort((l, r) => {
        return l.timestamp - r.timestamp;
      });

    let prevEnd = null;
    let running = 0;
    all_intervals.forEach((i) => {
      if (prevEnd != null) {
        // Check if the start of this interval crosses a date boundary form the
        // previous interval.
        if (prevEnd.isBefore(Moment.tz(i.timestamp, USER_TIMEZONE), 'day')) {
          // This new interval represents another date. Export what we have
          // and restart counting.
          const parts = Helpers.getParts(running);
          formattedData.push({
            name: p.name,
            date: prevEnd.format(DATE_FORMAT),
            hours: parts.hours,
            minutes: parts.minutes,
            seconds: parts.seconds,
            milliseconds: parts.milliseconds,
          });
          running = 0;
        }
      }

      prevEnd = Moment.tz(i.timestamp, USER_TIMEZONE)
      running += i.diff;
    });

    // No matter what, we will not have processed the last incrmeent.
    const parts = Helpers.getParts(running);
    formattedData.push({
      name: p.name,
      date: prevEnd.format(DATE_FORMAT),
      hours: parts.hours,
      minutes: parts.minutes,
      seconds: parts.seconds,
      milliseconds: parts.milliseconds,
    });
  });
  return formattedData;
}

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

  exportToCsv: function(state, payload) {
    if (typeof payload !== 'object' || typeof payload.type !== 'string') {
      Logger.error('No type provided.');
      return false;
    }

    const projects = Helpers.deactivateAll(Helpers.deepCopy(state.projects));
    let formattedData = [];
    switch(payload.type) {
      case 'SS':
        formattedData = {
          fields: ['name', 'start', 'end', 'manual'],
          data: formatSS(projects),
        };
        break;
      case 'D':
        formattedData = {
          fields: ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds'],
          data: formatD(projects)
        };
        break;
      default:
        Logger.error('Incorrect type. Could not parse using: ' + payload.type);
        return false;
    }

    ipcRenderer.send('export', {
      type: 'CSV',
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

  stopTimer: function(state, payload) {
    const data = Object.assign({}, payload);

    const index = Helpers.findProject(state.projects, data.id)
    if (index < 0) {
      return false;
    }

    state.projects = Helpers.deactivateAll(state.projects);
    Helpers.persistState(state.projects);
  },

  updateTime: function(state) {
    state.currentTime = CURRENT_TIME();
  },
};
