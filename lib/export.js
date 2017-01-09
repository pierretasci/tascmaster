const { ipcMain } = require('electron');
const Papa = require('papaparse');
const Moment = require('moment-timezone');

const FORMAT_STRING = 'MM/DD/YYYY hh:mm:ss.SSS A z';

ipcMain.on('export', (e, payload) => {
  const rawData = payload.data;
  let exportData;

  switch(payload.type) {
    case 'CSV':
      console.log('exporting to csv: ', rawData);
      exportData = Papa.unparse(rawData);
      console.log(exportData);
      break;
    default:
      console.error(payload.type + ' is not a supported export type.');
  }
});
