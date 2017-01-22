const { dialog, ipcMain } = require('electron');
const Excel = require('exceljs');
const fs = require('fs');
const Papa = require('papaparse');
const Readable = require('stream').Readable;

ipcMain.on('export', (e, payload) => {
  const exportData = Papa.unparse(payload.data);
  const fileSavePath = dialog.showSaveDialog({
   title: 'Choose location to save data',
   filters: [
     { name: 'Excel', extensions: ['xlsx'] },
   ],
  });

  if (fileSavePath.indexOf('.xlsx') >= 0 || fileSavePath.indexOf('.xls') > 0) {
    const dataStream = new Readable();
    dataStream.push(exportData);
    dataStream.push(null);

    const workbook = new Excel.Workbook();
    workbook.csv.read(dataStream)
    .then(() => {
      return workbook.xlsx.writeFile(fileSavePath);
    })
    .then(() => {
      e.sender.send('fileSaved');
    })
    .catch((err) => {
      console.error(err);
    });
  }
});
