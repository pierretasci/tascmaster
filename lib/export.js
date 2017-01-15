const { dialog, ipcMain } = require('electron');
const fs = require('fs');
const Papa = require('papaparse');

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

 const fileSavePath = dialog.showSaveDialog({
   title: 'Choose location to save data'
 });

 fs.writeFile(fileSavePath, exportData, (err) => {
   if (!err) {
     e.sender.send('fileSaved');
   }
 });
});
