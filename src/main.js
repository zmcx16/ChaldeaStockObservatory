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

const menu_template = [
  {
    label: 'Menu',
    submenu: [
      { 
        label: 'About ChaldeaStockObservatory',
        click: () => {},
      },
      { 
        label: 'Quit',
        click: () => { quitAll(); }
      }
    ]
  }
]

app.on('ready', () => {
  let icon = path.join(__dirname, "","icon@2x.png");
  appIcon = new Tray(icon);
  let contextMenu = Menu.buildFromTemplate(tray_list.map(addCmdToTrayMenu));
  appIcon.setToolTip('Chaldea Stock Observatory');
  appIcon.setContextMenu(contextMenu);

  const menu = Menu.buildFromTemplate(menu_template)
  Menu.setApplicationMenu(menu)

  // render process
  mainWindow = new BrowserWindow({

    webPreferences: {
      nodeIntegration: true
    },
    width: 960, height: 600
    //,minWidth: 640, minHeight: 480
    //,maxWidth: 1024, maxHeight: 768
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

    console.log(__dirname);
    let script = path.join(path.resolve(__dirname, '..', '..'), 'ChaldeaStockObservatory-Core', 'src', 'main.py');
    core_proc = child_process.spawn('python', [script, '-port', port])
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  })

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
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
        mainWindow.show();
      } else {
        mainWindow.minimize();
      }
      break;
    case 'EXIT':
      quitAll();
      break;
    default:
      mainWindow.webContents.send('triggerTrayCmd', param);
      break;
  }
}

function quitAll(){
  app.quit();
  app.exit(0);
}

function addCmdToTrayMenu(cmd) {
  return {
    label: cmd.title,
    type: 'normal',
    click: () => { triggerTrayCmd(cmd); }
  };
}
