'use strict';

const path = require('path');
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

const child_process = require('child_process');

let appIcon = null;
let mainWindow = null;

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

function triggerTrayCmd(param) {
  //console.log(param);
  switch (param.cmd){
    case 'HIDDEN_SHOW':
      if (mainWindow.isMinimized()){
        mainWindow.show();
      }else{
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

function addCmdToMenu (cmd) {
  return {
    label: cmd.title,
    type: 'normal',
    click: () => { triggerTrayCmd(cmd); }
  };
}

function saveListView(event, user_data){
  console.log(user_data);
  var err = 0;
  event.sender.send('saveListView_callback', err);
}

function loadListView(event) {

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
}


app.on('ready', () => {
  let icon = path.join(__dirname, "","icon@2x.png");
  appIcon = new Tray(icon);
  let contextMenu = Menu.buildFromTemplate(tray_list.map(addCmdToMenu));
  appIcon.setToolTip('Chaldea Stock Observatory');
  appIcon.setContextMenu(contextMenu);

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

});

ipc.on('saveListView', saveListView);
ipc.on('loadListView', loadListView);
//ipc.on('RequestStock', requestStock);


let pyProc = null;

const createPyProc = () => {

  let script = path.join('I:\\work\\WORK\\ChaldeaStockObservatory\\ChaldeaStockObservatory-Core\\src', 'main.py');

  pyProc = child_process.spawn('python', [script])

  const zerorpc = require("zerorpc");
  let client = new zerorpc.Client();
  client.connect("tcp://127.0.0.1:7777");

  client.invoke("test", "hello world", (error, res) => {
    if (error) {
      console.error(error);
    } else {
      console.log(res);
    }
  })

}

const exitPyProc = () => {
  console.log('kill pyProc');
  pyProc.kill();
  pyProc = null;
}

app.on('ready', createPyProc);
app.on('will-quit', exitPyProc);


