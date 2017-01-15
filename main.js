'use strict';

const electron = require('electron');
const {app, BrowserWindow, ipcMain, globalShortcut} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const { readState, writeState } = require('./lib/persistence');
const { exec } = require('child_process');
require('./lib/export');

const DEFAULT_WINDOW_WIDTH = 400;
const TITLE_BAR_SIZE = 22;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  let display = electron.screen.getPrimaryDisplay();
  // Since we can't dynamically resize this for windows, we need to set an good starting height.
  const startingHeight = (process.platform === 'win32' ? 300 : 30);

  // Create the browser window.
  win = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    height: startingHeight,
    transparent: true,
    width: DEFAULT_WINDOW_WIDTH,
    x: display.bounds.width - DEFAULT_WINDOW_WIDTH,
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
    win = null;
  });

  // Register our shortcuts.
  const altLeft = globalShortcut.register('Alt+Left', () => {
    const rectangle = win.getBounds();
    rectangle.x = 0;
    win.setBounds(rectangle, true);
  });
  const altRight = globalShortcut.register('Alt+Right', () => {
    const rectangle = win.getBounds();
    rectangle.x = display.bounds.width - rectangle.width;
    win.setBounds(rectangle, true);
  });
  const altUp = globalShortcut.register('Alt+Up', () => {
    const rectangle = win.getBounds();
    rectangle.y = 0;
    win.setBounds(rectangle, true);
  });
  const altDown = globalShortcut.register('Alt+Down', () => {
    const rectangle = win.getBounds();
    rectangle.y = display.bounds.height - rectangle.height;
    win.setBounds(rectangle, true);
  });

  if (!altLeft || !altRight || !altUp || !altDown) {
    console.error('Could not register global shortcuts');
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
  rectangle.height = nHeight + TITLE_BAR_SIZE;
  win.setBounds(rectangle, true);
});

ipcMain.on('newState', (e, state) => {
  writeState(state);
});

ipcMain.on('loadInitialState', (e) => {
  readState((data) => {
    e.sender.send('receiveInitialState', data);
  });
});
