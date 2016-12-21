const fs = require('fs');
const { app } = require('electron');
const path = require('path');
const PROJECTS_FILE = path.join(app.getPath('userData'), 'state.txt');

module.exports = {
  readState: function() {
    try {
      const retval = fs.readFileSync(PROJECTS_FILE, { encoding: 'utf8' });
      console.log('Found state: ' + retval);
      return JSON.parse(retval);
    } catch(e) {
      console.error(e);
      return false;
    }
  },
  writeState: function(state) {
    console.log('Persisting ' + JSON.stringify(state));
    try {
      fs.writeFile(PROJECTS_FILE, JSON.stringify(state));
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }
}
