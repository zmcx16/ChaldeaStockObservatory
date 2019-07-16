
const electron = require('electron');
const ipc = electron.ipcRenderer;
const NotificationDef = require('./notification-def.js');

// var
var enable_sync = false;
var notification_setting = {};
var notification_status = {};
var notification_interval = null;
var dialog_now = '';

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
        notification_status = {};
        notification_status["data"] = [];
        notification_setting.data.forEach(function (item) {
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
    dragList();
    
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

    $('#check-dialog-ok-btn').click(function () {
        if (dialog_now.indexOf('del-stock-')!=-1) {
            let stock_name = dialog_now.replace('del-stock-','');
            $(".item.stock_" + stock_name).remove();
            notification_setting.data.forEach(function (item, index, object) {
                if (item.symbol === stock_name) {
                    object.splice(index, 1);
                }
            });
            ipc.send("saveNotificationSetting", notification_setting);
            $(".check-dialog-close").trigger("click");
        } else if (dialog_now.indexOf('edit-stock-') != -1){
            $(".check-dialog-close").trigger("click");
        }
    });

    $('#reorder-button').click(function () {
        if ($('#reorder-button').hasClass('reorder-running')) {

            resetReorderButton();
            let stocks_copy = notification_setting.data.slice();
            notification_setting.data.length = 0
            let item_list = $('.item');
            item_list.each(function (row_index) {
                let stock_name = $(item_list[row_index]).children('.list-cell.symbol')[0].innerText;
                stocks_copy.some(function (stock) {
                    if (stock.symbol === stock_name) {
                        notification_setting.data.push(stock);
                        return true;
                    }else{
                        return false;
                    }
                });
            });

            initStockSetting();
            ipc.send("saveNotificationSetting", notification_setting);
        }
        else {
            $('#reorder-button').addClass('reorder-running');
            $('#reorder-button').text('Reordering');
            $('.drag-tab').attr('style', 'display: inline-block;');
            $('.status-tab').attr('style', 'display: none;');
        }

        return;
    });
});

// main function
function resetReorderButton() {
    $('#reorder-button').removeClass('reorder-running');
    $('#reorder-button').text('Reorder');
    $('.drag-tab').attr('style', 'display: none;');
    $('.status-tab').attr('style', 'display: inline-block;');
}

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

    $('.btn-toggle').unbind("click");
    $('.btn-toggle').on('click', function (event) {
        var button = event.target;
        let item_name = $(this).closest('li')[0].className;
        let stock_name = item_name.replace('item stock_', '');
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

        ipc.send("saveNotificationSettingAndUpdateStatus", notification_setting);
    });

    $('.close.remove').unbind("click");
    $('.close.remove').click(function () {
        let item_name = $(this).closest('li')[0].className;
        let stock_name = item_name.replace('item stock_', '');
        dialog_now = 'del-stock-' + stock_name;
        $('#check-dialog-title')[0].innerText = "Are you sure you want to delete '" + stock_name + "'?";
        $('#check-dialog-hidden-btn').click();
    });

    $('.edit-btn').unbind("click");
    $('.edit-btn').click(function () {
        let item_name = $(this).closest('li')[0].className;
        let stock_name = item_name.replace('item stock_', '');
        dialog_now = 'edit-stock-' + stock_name;
        $('#edit-dialog-title')[0].innerText = "Edit '" + stock_name + "' Notification Conditions";
        $('#edit-dialog-hidden-btn').click();
    });
}

function initStockSetting() {

    // set notification item
    $(".item").remove();

    notification_setting.data.forEach(function (setting_item) {
        notification_status.data.some(function (status_item) {
            if (setting_item.symbol === status_item.symbol) {
                addStock(status_item.symbol, status_item.openP, status_item.highP, status_item.lowP, status_item.closeP, status_item.changeP, status_item.volume, setting_item.enable);
                return true;
            }
            else{
                return false;
            }
        });
    });

    updateStocksColor();

    resetReorderButton();
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