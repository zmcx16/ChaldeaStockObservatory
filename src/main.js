'use strict';

const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;

let appIcon = null;
let mainWindow = null;

const tray_list = [
  {
    title: 'Hidden / Show',
    contents: 'Hidden / Show content'
  },
  {
    title: 'Stock Screener',
    contents: 'Stock Screener content'
  },
  {
    title: 'Notifications',
    contents: 'Notifications content'
  }
];

function triggerTrayCmd(param) {
  mainWindow.webContents.send('triggerTrayCmd', param);
}

function addCmdToMenu (cmd) {
  return {
    label: cmd.title,
    type: 'normal',
    click: () => { triggerTrayCmd(cmd); }
  };
}

app.on('ready', () => {
  appIcon = new Tray('icon@2x.png');
  let contextMenu = Menu.buildFromTemplate(tray_list.map(addCmdToMenu));
  appIcon.setToolTip('Chaldea Stock Observatory');
  appIcon.setContextMenu(contextMenu);

  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    minWidth: 640, minHeight: 480,
    maxWidth: 1024, maxHeight: 768
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.on('dom-ready', () => {
    triggerTrayCmd(tray_list[0]);
  });
});
