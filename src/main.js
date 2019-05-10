'use strict';

const path = require('path');
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

const child_process = require('child_process');
const detect_port = require('detect-port');

let appIcon = null;
let mainWindow = null;

let port = '';
let core_proc = null;


const tray_list = [
  {
    cmd: 'HIDDEN_SHOW',
    title: 'Hidden / Show'
  },
  {
    cmd: 'SCREENER',
    title: 'Stock Screener'
  },
  {
    cmd: 'NOTIFICATION',
    title: 'Notifications'
  },
  {
    cmd: 'EXIT',
    title: 'Exit'
  }
];


app.on('ready', () => {
  let icon = path.join(__dirname, "","icon@2x.png");
  appIcon = new Tray(icon);
  let contextMenu = Menu.buildFromTemplate(tray_list.map(addCmdToMenu));
  appIcon.setToolTip('Chaldea Stock Observatory');
  appIcon.setContextMenu(contextMenu);

  // render process
  mainWindow = new BrowserWindow({

    webPreferences: {
      nodeIntegration: true
    },
    width: 920, height: 600/*,
    minWidth: 640, minHeight: 480,
    maxWidth: 1024, maxHeight: 768*/
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.on('dom-ready', () => {
      //triggerTrayCmd(tray_list[0]);
  });

  // core process
  let port_candidate = '7777';
  detect_port(port_candidate, (err, _port) => {
    if (err) {
      console.log(err);
    }

    if (port_candidate == _port) {
      console.log(`port: ${port_candidate} was not occupied`);
      port = port_candidate;
    } else {
      console.log(`port: ${port_candidate} was occupied, try port: ${_port}`);
      port = _port;
    }

    let script = path.join(path.resolve(__dirname, '..', '..', '..'), 'ChaldeaStockObservatory-Core', 'src', 'main.py');
    core_proc = child_process.spawn('python', [script, port])
  });

});


ipc.on('saveListView', (event, user_data)=>{
  console.log(user_data);
  var err = 0;
  event.sender.send('saveListView_callback', err);
});

ipc.on('loadListView', (event) => {
  var user_data = {};
  user_data['ListView'] = [
    {
      name: 'List1',
      symbols: ['AAPL', 'GOOG']
    },
    {
      name: 'List2',
      symbols: ['T', 'PSX']
    }
  ];

  event.sender.send('loadListView_callback', 0, user_data);
});


ipc.on('getPort', (event) => {
  console.log('get port: ' + port);
  event.sender.send('getPort_callback', port);
});

app.on('will-quit', () => {
  console.log('kill core process');
  core_proc.kill();
  core_proc = null;
});


// main function
function triggerTrayCmd(param) {
  //console.log(param);
  switch (param.cmd) {
    case 'HIDDEN_SHOW':
      if (mainWindow.isMinimized()) {
        mainWindow.show();
      } else {
        mainWindow.minimize();
      }
      break;
    case 'EXIT':
      app.quit();
      break;
    default:
      mainWindow.webContents.send('triggerTrayCmd', param);
      break;
  }
}

function addCmdToMenu(cmd) {
  return {
    label: cmd.title,
    type: 'normal',
    click: () => { triggerTrayCmd(cmd); }
  };
}
