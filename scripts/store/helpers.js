const CURRENT_TIME = require('../utils/time');
const Logger = require('../utils/logger');
const Validator = require('validator');

module.exports = {
  findProject: function(arr, id) {
    if (typeof id !== 'string' && Validator.isEmpty(id)) {
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

  // Returns a better view of the projects for use in persisting them to disk.
  cleanProjects: function(projects) {
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
  },

  deepCopy: function(a) {
    return JSON.parse(JSON.stringify(a));
  },

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
};
