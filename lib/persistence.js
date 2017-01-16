const fs = require('fs');
const { app } = require('electron');
const path = require('path');

const PROJECTS_FILE = path.join(app.getPath('userData'), 'state');
const APP_VERSION = app.getVersion();

const verParts = function(version) {
  if (typeof version !== 'string') {
    return { major: 0, minor: 0, patch: 0 };
  }

  const parts = version.split('.');
  return {
    major: parseInt(parts[0]),
    minor: parseInt(parts[1]),
    patch: parseInt(parts[2])
  };
}

const rw = {
  readState: function(cb) {
    fs.readFile(PROJECTS_FILE, { encoding: 'utf8' }, (err, data) => {
      if (!err) {
        const parsed = JSON.parse(data);

        const readMajorVersion = verParts(parsed.version).major;
        const appMajorVersion = verParts(APP_VERSION).major;
        if (appMajorVersion !== readMajorVersion) {
          console.warn('Clearing state due to mismatched major versions.');
          rw.writeState([]);
          return cb([]);
        }
        return cb(parsed.data);
      } else {
        console.error(err);
      }
    });
  },
  writeState: function(state) {
    const raw = JSON.stringify({ version: APP_VERSION, data: state });
    fs.writeFile(PROJECTS_FILE, raw);
  },
}

module.exports = rw;
