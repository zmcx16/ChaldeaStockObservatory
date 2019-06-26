/* eslint-disable no-console */
'use strict';

// def
const USER_DATA = 'user_data';
const STOCK_DATA_FILE_NAME = 'stock_data.json';
const NOTIFICATION_DATA_FILE_NAME = 'notification_data.json';
const CONFIG_FILE_NAME = 'config.json';

// module
const path = require('path');
const os = require('os');
const fs = require('fs');
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const app_path = app.getAppPath();
const platform = os.platform();

const child_process = require('child_process');
const detect_port = require('detect-port');

//const notification_core = require('./notification-core.js');
//notification_core.init();

let appIcon = null;
let mainWindow = null;
let notifyWindow = null;
let settingWindow = null;

let port = '';
let core_proc = null;

var root_path = '';
var user_data_path = '';

var setting_data = {};

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
        click: () => {}
      },
      {
        label: 'Debug Console',
        click: () => { 
          if (mainWindow != null && mainWindow.isFocused())
            mainWindow.webContents.openDevTools();
          else if (notifyWindow != null && notifyWindow.isFocused())
            notifyWindow.webContents.openDevTools();
          else if (settingWindow != null && settingWindow.isFocused())
            settingWindow.webContents.openDevTools();
        }
      },
      { 
        label: 'Quit',
        click: () => { quitAll(); }
      }
    ]
  }
]

// app register
app.on('ready', () => {
  let icon = path.join(__dirname, "","tray-icon.png");
  appIcon = new Tray(icon);
  let contextMenu = Menu.buildFromTemplate(tray_list.map(addCmdToTrayMenu));
  appIcon.setToolTip('Chaldea Stock Observatory');
  appIcon.setContextMenu(contextMenu);

  const menu = Menu.buildFromTemplate(menu_template)
  Menu.setApplicationMenu(menu)

  // render process
  mainWindow = new BrowserWindow({

    icon: path.join(__dirname, 'ChaldeaStockObservatory.png'),
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

    console.log('dir path:' + __dirname);
    console.log('platform:' + platform);
    let script = path.join(path.resolve(__dirname, '..', '..'), 'ChaldeaStockObservatory-Core', 'src', 'core.py');
    if (!fs.existsSync(script)) {
      if (platform == 'win32') {
        script = path.join(__dirname, 'core-win', 'core.exe');
      }else if(platform == 'darwin'){
        script = path.join(__dirname, 'core-mac', 'core');
      } else if (platform == 'linux'){
        script = path.join(__dirname, 'core-linux', 'core');
      } 
      console.log(script);
      core_proc = child_process.execFile(script, ['-port', port]);

    }else{
      core_proc = child_process.spawn('python', [script, '-port', port]);
    }

  });

  //get path
  if (app_path.indexOf('default_app.asar') != -1)  //dev mode
    root_path = path.resolve(path.dirname(app_path), '..', '..', '..', '..');
  else  //binary mode
    root_path = path.resolve(path.dirname(app_path), '..');

  if (platform == 'linux') {
    const homedir = os.homedir();
    user_data_path = path.join(homedir, '.ChaldeaStockObservatory', USER_DATA);
  } else {
    user_data_path = path.join(root_path, USER_DATA);
  }

  if (!fs.existsSync(user_data_path)) {
    fs.mkdirSync(user_data_path, { recursive: true });
  }



  mainWindow.on('close', (event) => {
    event.sender.send('doSaveStockData');
    event.preventDefault();
    mainWindow.hide();
  })

});

app.on('will-quit', () => {
  console.log('kill core process');
  core_proc.kill();
  core_proc = null;
});


// ipc register
ipc.on('getPort', (event) => {
  console.log('get port: ' + port);
  event.sender.send('getPort_callback', port);
});

ipc.on('getPortSync', (event) => {
  console.log('get port: ' + port);
  event.returnValue = port;
});

ipc.on('navToWebsite', (event, link) => {
  if (platform == 'win32') {
    child_process.execSync('start ' + link);
  } else if (platform == 'darwin'){
    child_process.execSync('open ' + link);
  } else if (platform == 'linux'){
    child_process.execSync('xdg-open ' + link);
  }
});

ipc.on('openNotificationWindow', () => {
  if (!notifyWindow) {
    console.log('open Notification Window');
    notifyWindow = new BrowserWindow({
      icon: path.join(__dirname, 'ChaldeaStockObservatory.png'),
      webPreferences: {
        nodeIntegration: true
      },
      width: 900, height: 600
    });

    notifyWindow.loadURL(`file://${__dirname}/notification.html`);

    notifyWindow.on('closed', () => {
      notifyWindow = null
    })
  }
});

ipc.on('openSettingWindow', () => {
  if (!settingWindow) {
    console.log('open Setting Window');
    settingWindow = new BrowserWindow({
      icon: path.join(__dirname, 'ChaldeaStockObservatory.png'),
      webPreferences: {
        nodeIntegration: true
      },
      width: 680, height: 300
    });

    settingWindow.loadURL(`file://${__dirname}/setting.html`);

    settingWindow.on('closed', () => {
      settingWindow = null
    })
  }
});

ipc.on('loadStockData', (event) => {
  event.returnValue = loadDataSync(STOCK_DATA_FILE_NAME);
});

ipc.on('saveStockData', (event, target_data) => {
  saveDataSync(STOCK_DATA_FILE_NAME, target_data);
});

ipc.on('loadConfigData', (event) => {
  event.returnValue = setting_data;
});

ipc.on('saveConfigData', (event, target_data) => {
  saveDataSync(CONFIG_FILE_NAME, target_data);
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

function saveDataSync(file_name, target_data){
  console.log('save ' + file_name);
  fs.writeFileSync(path.join(user_data_path, file_name), JSON.stringify(target_data), 'utf8');
}

function loadDataSync(file_name) {
  console.log('load ' + file_name);
  let output = '';
  let file_path = path.join(user_data_path, file_name);
  if (fs.existsSync(file_path)) {
    let data = fs.readFileSync(file_path, 'utf8');
    output = JSON.parse(data);
  }

  return output;
}



// OnStart
setting_data = loadDataSync(CONFIG_FILE_NAME);

if (Object.keys(setting_data).length === 0) {
  setting_data = {
    "data": {
      "sync": {
        "day_start": "2125",
        "day_end": "0505",
        "week_sun": false,
        "week_mon": true,
        "week_tue": true,
        "week_wed": true,
        "week_thu": true,
        "week_fri": true,
        "week_sat": false,
        "interval": 10
      }
    }
  }
}
