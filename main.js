'use strict';

const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');

const PROJECTS_FILE = path.join(app.getPath('userData'), 'state.txt');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  let display = electron.screen.getPrimaryDisplay();

  // Create the browser window.
  win = new BrowserWindow({
    alwaysOnTop: true,
    height: 50,
    width: 400,
    x: display.bounds.width,
    y: 0,
  });
  win.show();

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  try {
    const state = fs.readFileSync(PROJECTS_FILE, { encoding: 'utf8' });
    console.log(state);
  } catch(e) {
    console.error(e);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('updateHeight', (e, nHeight) => {
  const rectangle = win.getBounds();
  console.log(rectangle);
  rectangle.height = nHeight;
  console.log(rectangle);
  win.setBounds(rectangle, true);
});

ipcMain.on('newState', (e, state) => {
   fs.writeFileSync(PROJECTS_FILE, JSON.stringify(state));
});
