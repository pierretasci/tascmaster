const fs = require('fs');
const { app } = require('electron');
const path = require('path');
const PROJECTS_FILE = path.join(app.getPath('userData'), 'state');

module.exports = {
  readState: function(cb) {
    fs.readFile(PROJECTS_FILE, { encoding: 'utf8' }, cb);
  },
  writeState: function(state) {
    fs.writeFile(PROJECTS_FILE, JSON.stringify(state));
  }
}
