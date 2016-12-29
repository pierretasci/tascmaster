const Log = require('electron-log');
const DEV_ENV = 'dev';
const PROD_ENV = 'prod';

const env = process.env.NODE_ENV || DEV_ENV;
const LOG_FORMAT = '{y}/{m}/{d} {h}:{i}:{s}.{ms} {level}: {text}';

if (env === DEV_ENV) {
    Log.transports.console.level = 'debug';
    Log.transports.console.format = LOG_FORMAT;
    Log.transports.file = false;
}

if (env === PROD_ENV) {
    Log.transports.console = false;
    Log.transports.file.format = LOG_FORMAT;
}

module.exports = Log;
