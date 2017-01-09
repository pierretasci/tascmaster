const { ipcRenderer } = require('electron');
const CURRENT_TIME = require('../utils/time');
const Logger = require('../utils/logger');
const Validator = require('validator');

const MS_PER_S = 1000;
const MS_PER_M = MS_PER_S * 60;
const MS_PER_H = MS_PER_M * 60;

module.exports = {
  createNewProject: function(id, name) {
    return {
      id: id,
      name: name,
      increments: [],
      currentStart: -1,
      active: false,
      artificialTime: [],
    };
  },

  /**
   * Turn off (make not active) all of the provided projects. For any that were
   * active, add an increment to them.
   */
  deactivateAll: function(projects) {
    const stopTime = CURRENT_TIME();

    return projects.map((p) => {
      if (p.active) {
        p.increments.push({
          start: p.currentStart,
          end: stopTime,
        });
      }
      // When we persist the project, we always set it's active status time as
      // false.
      p.active = false;
      p.currentStart = -1;
      return p;
    });
  },

  deepCopy: function(a) {
    return JSON.parse(JSON.stringify(a));
  },

  findProject: function(arr, id) {
    if (typeof id !== 'string' || Validator.isEmpty(id)) {
      Logger.warn('Received a non-existant id value! Id was: ' + id);
      return  -1;
    }

    for(let i = 0; i < arr.length; ++i) {
      if (arr[i].id === id) {
        return i;
      }
    }
    Logger.info('Could not find id ' + id + '. Returning default.');
    return -1;
  },

  // Returns the hours, minutes, seconds, and milliseconds from diff.
  getParts: function(duration) {
    if (typeof duration !== 'number') {
      Logger.error('Duration must be passed as a number.');
      return false;
    }

    const parts = {};
    let runningDuration = duration;

    parts.hours = Math.floor(runningDuration/MS_PER_H);
    runningDuration = runningDuration % MS_PER_H;

    parts.minutes = Math.floor(runningDuration/MS_PER_M);
    runningDuration = runningDuration % MS_PER_M;

    parts.seconds = Math.floor(runningDuration/MS_PER_S);
    runningDuration = runningDuration % MS_PER_S;

    parts.milliseconds = runningDuration;

    return parts;
  },

  // Start an interval to periodically persist the state.
  persistState: function(projects) {
    ipcRenderer.send('newState', this.deactivateAll(this.deepCopy(projects)));
  }
};
