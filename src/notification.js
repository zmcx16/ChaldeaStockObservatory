
const electron = require('electron');
const ipc = electron.ipcRenderer;
const NotificationDef = require('./notification-def.js');

// var
var enable_sync = false;
var notification_setting = {};
var notification_status = {};
var notification_interval = null;

// ipc register
ipc.on('syncNotificationStatus', (event, data) => {
    notification_status = data;
    updateOHLCV();
});

ipc.on('syncConfigData', (event, data) => {
    setting_data = data;
});

// OnStart
$(document).ready(function () {

    setting_data = ipc.sendSync("loadConfigData");
    notification_setting = ipc.sendSync('getNotificationSetting');
    notification_status = ipc.sendSync('getNotificationStatus');

    if (Object.keys(notification_setting).length === 0) {
        notification_setting = {};
        notification_setting["data"] = [];
    }

    if (Object.keys(notification_status).length === 0) {
        notification_setting.data.forEach(function (item) {
            notification_status = {};
            notification_status["data"] = [];
            notification_status.data.push({
                "symbol": item.symbol,
                "openP": "-",
                "highP": "-",
                "lowP": "-",
                "closeP": "-",
                "changeP": "0%",
                "volume": "-",
                "messages": []
            });
        })
    }

    initStockSetting();

    checkEnableSync();
    notification_interval = setInterval(checkEnableSync, parseInt(setting_data["data"]["sync"]["interval"]) * 1000);

    $("#add-popup").hide();

    $(document).click(function (event) {
        if (!$(event.target).is("#add-button, #add-popup, #search-bar, #add-symbol-input, #search-icon, .add-popup-text")) {
            $("#add-popup").hide();
        }
    });

    $('#add-button').click(function () {
        var add_btn_loc = getPosition($('#add-button')[0]);
        var offset_x = $('#add-button')[0].offsetWidth / 2;
        var offset_y = $('#add-button')[0].offsetHeight;
        $('#add-popup').attr('style', `display: block; left: ${add_btn_loc.x + offset_x}; top: ${add_btn_loc.y + offset_y};`);
    });

    $('#search-icon').click(function () {

        let symbols = $('#add-symbol-input')[0].value.split(",");
        $('#add-symbol-input')[0].value = "";
        symbols.forEach(function (symbol) {
            notification_setting.data.push({
                "symbol": symbol,
                "enable": true,
                "edit": []
            });

            addStock(symbol, "-", "-", "-", "-", "0%", "-", true);
        })

        $("#add-popup").hide();
        ipc.send("saveNotificationSettingAndUpdateStatus", notification_setting);
    })
});

// main function
function checkEnableSync()
{
    enable_sync = needEnableSync(setting_data['data']['sync']);
    updateSyncLed(enable_sync);
}

function setLedStatus(name, led) {
    $('.stock_' + name + ' .status-tab .led-green').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .led-blue').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .led-yellow').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .'+led).attr('style', 'display: block;');
}

function updateOHLCV() {

    checkEnableSync();

    // update UI
    notification_status.data.forEach(function (item) {
        let data = {};
        data['symbol'] = item['symbol'];
        data['openP'] = item['openP'];
        data['highP'] = item['highP'];
        data['lowP'] = item['lowP'];
        data['closeP'] = item['closeP'];
        data['volume'] = item['volume'];
        data['changeP'] = item['changeP'];
        updateOHLCV_UI("notification", data, enable_sync, null);
    });   
}

function addStock(symbol, openP, highP, lowP, closeP, changeP, volume, enable){
    var class_name = 'stock_' + symbol;
    if ($("." + class_name).length === 0) {
        let temp = notification_container_template.replace('{name}', symbol);
        temp = temp.replace('{symbol}', symbol);
        temp = temp.replace('{openP}', openP);
        temp = temp.replace('{highP}', highP);
        temp = temp.replace('{lowP}', lowP);
        temp = temp.replace('{closeP}', closeP);
        temp = temp.replace('{changeP}', changeP);
        temp = temp.replace('{volume}', volume);
        if (enable) {
            temp = temp.replace('{active}', 'active');
        }
        else {
            temp = temp.replace('{active}', '');
        }

        $("#list").append(temp);

        setLedStatus(symbol, enable ? "led-green" : "led-blue");
    }
}

function initStockSetting() {

    // unbind event
    $('.btn-toggle').unbind("click");

    // set notification item
    $(".item").remove();
    let notification_enable_dict = {};
    notification_setting.data.forEach(function (item) {
        notification_enable_dict[item.symbol] = item.enable;
    });
    notification_status.data.forEach(function (item) {
        addStock(item.symbol, item.openP, item.highP, item.lowP, item.closeP, item.changeP, item.volume, notification_enable_dict[item.symbol]); 
    });

    $('.btn-toggle').on('click', function (event) {
        var button = event.target;
        let item_name = $(this).closest('li')[0].className;
        let stock_name = item_name.replace('item stock_','');
        notification_setting.data.forEach(function (item) {
            if (item.symbol === stock_name) {
                item.enable = button.className.indexOf('active') == -1; //in this timing, UI doesn't change yet.
                if (item.enable) {
                    setLedStatus(item.symbol, "led-green");
                }
                else {
                    setLedStatus(item.symbol, "led-blue");
                }
            }
        });  
    });

    updateStocksColor();
}


/* template data */
const notification_container_template = `
<li class="item stock_{name}">
    <div class="drag-tab" style="display:none;">
    <div></div>
    <div></div>
    <div></div>
    </div>
    <div class="status-tab">
        <div class="led-green"></div>
        <div class="led-blue" style="display:none;"></div>
        <div class="led-yellow" style="display:none;"></div>
    </div>
    <span class="list-cell symbol">{symbol}</span>
    <span class="list-cell openP">{openP}</span>
    <span class="list-cell highP">{highP}</span>
    <span class="list-cell lowP">{lowP}</span>
    <span class="list-cell closeP">{closeP}</span>
    <span class="list-cell changeP">{changeP}</span>
    <span class="list-cell volume">{volume}</span>
    <div class="list-cell edit"><button type="button" class="click-btn-v1 edit-btn">Edit</button></div>
    <div class="list-cell enable">
        <button type="button" class="btn btn-sm btn-toggle {active}" data-toggle="button" aria-pressed="false" autocomplete="off">
            <div class="handle"></div>
        </button>
    </div>
    <span class="list-cell remove"><button type="button" class="close remove"><span>&times;</span></button></span>
</li>
`;