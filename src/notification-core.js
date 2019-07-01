const zerorpc = require("zerorpc");
var client = new zerorpc.Client();

// var
var notification_data = {};
var setting_data = {};
var notification_core_interval = null;
var port = null;
var notification_core_event = null;


exports.onStart = function (_notification_data, _setting_data, _port, _notification_core_event) {
    notification_data = _notification_data;  
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
                notification_core_event(notification_data);
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

function sendCmdToCore(cmd, msg, callback) {
    client.invoke(cmd, msg, (error, res) => {
        callback(error, res);
    });
}