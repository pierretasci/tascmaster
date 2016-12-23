'use strict';

const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const { readState, writeState } = require('./lib/persistence');

const DEFAULT_WINDOW_WIDTH = 400;
const TITLE_BAR_SIZE = 22;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  let display = electron.screen.getPrimaryDisplay();

  // Create the browser window.
  win = new BrowserWindow({
    alwaysOnTop: true,
    height: 30,
    width: DEFAULT_WINDOW_WIDTH,
    x: display.bounds.width - DEFAULT_WINDOW_WIDTH,
    y: 0,
  });
  console.log(win.getBounds());
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
  console.log('Request to update height to ' + nHeight);
  const rectangle = win.getBounds();
  rectangle.height = nHeight + TITLE_BAR_SIZE;
  win.setBounds(rectangle, true);
});

ipcMain.on('newState', (e, state) => {
  writeState(state);
});

ipcMain.on('loadInitialState', (e) => {
  e.sender.send('receiveInitialState', readState());
});
