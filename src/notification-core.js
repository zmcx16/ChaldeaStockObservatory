const zerorpc = require("zerorpc");
var client = new zerorpc.Client();
const NotificationDef = require('./notification-def.js');

// var
var notification_data = {};
var notification_status = {};
var setting_data = {};
var notification_core_interval = null;
var port = null;
var notification_core_event = null;


exports.onStart = function (_notification_data, _notification_status, _setting_data, _port, _notification_core_event) {
    notification_data = _notification_data;
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
    let stocks = notification_data.data;
    stocks.forEach(function (item) {
        sendCmdToCore('get_realtime_stock', item.symbol, (error, res) => {
            if (error) {
                console.error(error);
            } else {
                updateStockInNotificationData(res);
                checkConditions();
                notification_core_event(notification_data, notification_status);
            }
        });
    });
}

function updateStockInNotificationData(stock){
    notification_data.data.forEach(function (item) {
        if (stock.symbol === item.symbol) {
            item.openP = stock.openP;
            item.highP = stock.highP;
            item.lowP = stock.lowP;
            item.closeP = stock.closeP;
            item.volume = stock.volume;
            item.changeP = stock.changeP;
        }
    });
}

function checkConditions(){
    notification_data.data.forEach(function (item) {
        item.edit.forEach(function (condition) {
            CheckFuncMappingTable[condition[NotificationDef.KEY_TYPE]]();
        });
    });
}

function sendCmdToCore(cmd, msg, callback) {
    client.invoke(cmd, msg, (error, res) => {
        callback(error, res);
    });
}

var func_st = () => {
    console.log("xxx");
}

var CheckFuncMappingTable = {
    [NotificationDef.SMALLER_THAN]: func_st
}


