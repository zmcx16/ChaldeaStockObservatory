function triggerTrayCmd(event, param) {
  document.getElementById('title').innerText = param.title;
  document.getElementById('contents').innerText = param.contents;
}

const ipc = require('electron').ipcRenderer;
ipc.on('triggerTrayCmd', triggerTrayCmd);
