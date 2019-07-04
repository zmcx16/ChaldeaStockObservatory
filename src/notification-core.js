const zerorpc = require("zerorpc");
var client = new zerorpc.Client();
const NotificationDef = require('./notification-def.js');

// var
var notification_setting = {};
var notification_status = {};
var setting_data = {};
var notification_core_interval = null;
var port = null;
var notification_core_event = null;


exports.onStart = function (_notification_setting, _notification_status, _setting_data, _port, _notification_core_event) {
    notification_setting = _notification_setting;
    notification_status = _notification_status;
    setting_data = _setting_data;
    port = _port;
    notification_core_event = _notification_core_event;

    client.connect("tcp://127.0.0.1:" + port);
    notification_core_interval = setInterval(doScanNotification, parseInt(setting_data["data"]["sync"]["interval"]) * 1000);
    console.log("notification-core Initialize.");

};


// private function
function doScanNotification() {
    sendCmdToCore('scan_notification', notification_setting, (error, res) => {
        if (error) {
            console.error(error);
        } else {
            notification_status = res;
            notification_core_event(notification_status);
        }
    });
}

function sendCmdToCore(cmd, msg, callback) {
    client.invoke(cmd, msg, (error, res) => {
        callback(error, res);
    });
}


