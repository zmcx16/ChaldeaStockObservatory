
const electron = require('electron');
const ipc = electron.ipcRenderer;
const NotificationDef = require('./notification-def.js');

// var
var enable_sync = false;
var notification_setting = {};
var notification_setting_editing = {};
var notification_status = {};
var notification_interval = null;
var dialog_now = '';

// ipc register
ipc.on('syncNotificationStatus', (event, data) => {
    notification_status = data;

    let notification_status_trigger = {};
    notification_status.data.forEach(function (item) {
        if (item.messages.length > 0)
            notification_status_trigger[item.symbol] = true;
    });
    
    notification_setting.data.forEach(function (item) {    
        if (item.enable) {
            if (item.symbol in notification_status_trigger) {
                setLedStatus(item.symbol, "led-yellow");
            }
            else{
                setLedStatus(item.symbol, "led-green");
            }
        }
        else {
            setLedStatus(item.symbol, "led-blue");
        }     
    });

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
    setEditMenu();
    
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
        }
    });

    $('#edit-dialog-ok-btn').click(function () {
        if (dialog_now.indexOf('edit-stock-') != -1) {
            notification_setting = JSON.parse(JSON.stringify(notification_setting_editing));
            ipc.send("saveNotificationSettingAndUpdateStatus", notification_setting);
            $(".edit-dialog-close").trigger("click");
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

    $(".dropdown-menu.edit a").click(function () {
        $("#edit-dropdown-btn").text($(this).text());
        $("#edit-dropdown-btn").attr("key", $(this).attr("key"));
        setEditArgs();
    });

    $("#edit-clear-btn").click(function () {
        $(".arg-text-val").val('');
    });

    $("#edit-add-btn").click(function () {
        let stock_name = dialog_now.replace('edit-stock-','');
        let args = {};
        $(".arg-text-val").each(function () {
            if ($(this).val() != '')
                args[$(this).attr('id')] = $(this).val();
        });

        if (NotificationDef.NAME in args && Object.keys(args).length > 1){
            notification_setting_editing.data.some(function (item) {
                if (item.symbol == stock_name){
                    let name_invalid = false;
                    item.edit.some(function (edit_o) {
                        if (edit_o["name"] == args[NotificationDef.NAME]){
                            name_invalid = true;
                            return true;
                        }
                        return false;
                    });

                    if(name_invalid){
                        setEditDialogTitle('The name "' + args[NotificationDef.NAME] + '" is already exists.', 'red');
                        return true;
                    }

                    let new_arg = {};
                    new_arg['name'] = args[NotificationDef.NAME];
                    new_arg['type'] = $("#edit-dropdown-btn").attr("key");
                    new_arg['args'] = {};
                    Object.entries(args).forEach(([key, value]) => {
                        if (key != NotificationDef.NAME){
                            new_arg['args'][key] = value;
                        }
                    });
                    item.edit.push(new_arg);
                    initEditValues();
                    return true;
                }

                return false;
            });
        }
        else{
            setEditDialogTitle("Must input Name and at least one parameter.", 'red');
        }

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

    let notification_status_trigger = {};
    notification_status.data.forEach(function (item) {
        if (item.messages.length > 0)
            notification_status_trigger[item.symbol] = true;
    });

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

        if (enable) {
            if (symbol in notification_status_trigger) {
                setLedStatus(symbol, "led-yellow");
            }
            else {
                setLedStatus(symbol, "led-green");
            }
        }
        else {
            setLedStatus(symbol, "led-blue");
        }
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

    $('.close.remove-stock').unbind("click");
    $('.close.remove-stock').click(function () {
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
        notification_setting_editing = JSON.parse(JSON.stringify(notification_setting));
        setEditDialogTitle("Edit '" + stock_name + "' Notification Conditions", 'black');
        initEditValues();
        $('#edit-dialog-hidden-btn').click();
    });
}

function initStockSetting() {

    // set notification item
    $(".item").remove();

    notification_setting.data.forEach(function (setting_item) {
        let status_exist = false;
        notification_status.data.some(function (status_item) {
            if (setting_item.symbol === status_item.symbol) {
                addStock(status_item.symbol, status_item.openP, status_item.highP, status_item.lowP, status_item.closeP, status_item.changeP, status_item.volume, setting_item.enable);
                status_exist = true;
                return true;
            }
            return false;
        });

        if (!status_exist)
            addStock(setting_item.symbol, "-", "-", "-", "-", "0%", "-", setting_item.enable);
    });

    updateStocksColor();

    resetReorderButton();
}

function setEditMenu(){

    $(".dropdown-menu.edit")[0].innerHTML = '';

    let set_init = false
    Object.entries(NotificationDef.NOTIFICATION_TABLE.KEY_CONDITIONS).forEach(([key, value]) => {
        
        $(".dropdown-menu.edit")[0].innerHTML += '<a class="dropdown-item" href="#" key="' + key + '" >' + value.KEY_DISPLAY_NAME + '</a>';
        if (!set_init){
            $("#edit-dropdown-btn").text(value.KEY_DISPLAY_NAME);
            $("#edit-dropdown-btn").attr("key", key);
            set_init = true;
        }
    });

    setEditArgs();
}

function setEditArgs(){

    let now_condition = $("#edit-dropdown-btn").attr("key");
    $(".edit-args")[0].innerHTML = '<div class="arg-label-text"><div class="label-input">' + NotificationDef.NAME_DISPLAY + ":" + '</div><input type="text" class="arg-text-val name" id="' + NotificationDef.NAME + '" /></div>';
    NotificationDef.NOTIFICATION_TABLE.KEY_CONDITIONS[now_condition].KEY_VALUE.forEach(function (arg) {
        $(".edit-args")[0].innerHTML += '<div class="arg-label-text"><div class="label-input value">' + arg.KEY_DISPLAY_NAME + ":" + '</div><input type="text" class="arg-text-val" id="' + arg.KEY_NAME + '" /></div>';
    });
}

function setEditDialogTitle(content, color){
    $('#edit-dialog-title').attr('style', 'color:' + color);
    $('#edit-dialog-title')[0].innerText = content;
}

function initEditValues(){
    let stock_name = dialog_now.replace('edit-stock-', '');

    let notification_status_trigger = {};
    notification_status.data.forEach(function (item) {
        if (item.messages.length > 0){
            notification_status_trigger[item.symbol] = {};
            item.messages.forEach(function (message) {
                notification_status_trigger[item.symbol][message['name']] = message['trigger'];
            });
        }
    });

    $('.edit-values')[0].innerHTML = '';
    notification_setting_editing.data.some(function (item) {
        if (item.symbol === stock_name) {
            item.edit.forEach(function (edit_o) {
                let led = "led-green";
                if (item.symbol in notification_status_trigger && edit_o["name"] in notification_status_trigger[item.symbol])
                    led = "led-yellow";

                $('.edit-values')[0].innerHTML += '<div class="edit-value">'
                    + '<div class="edit-led ' + led + '"></div>'
                + '<div class="edit-name">' + edit_o["name"]+'</div>'
                + '<span class="edit-remove remove"><button type="button" class="close remove-edit"><span>&times;</span></button></span>'
                + '</div>';
            });
            return true;
        }

        return false;
    });

    $('.close.remove-edit').unbind("click");
    $('.close.remove-edit').click(function () {
        event.preventDefault();
        event.stopPropagation();
        let stock_name = dialog_now.replace('edit-stock-', '');
        let value_name = $(this).closest('div').children('.edit-name')[0].innerText;
        notification_setting_editing.data.some(function (item) {
            if (item.symbol == stock_name) {
                item.edit.some(function (edit_o, index, object) {
                    if (edit_o["name"] === value_name) {
                        object.splice(index, 1);
                        return true;
                    }
                    return false;
                });

                return true;
            }
            return false;
        });

        initEditValues();
    });

    $('.edit-value').unbind("click");
    $('.edit-value').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!$(event.target).is(".edit-remove, .close.remove-edit")) {
            let value_name = $(this).children('.edit-name')[0].innerText;
            displayEditValue(value_name);
        }
    });
}

function displayEditValue(value_name){

    let stock_name = dialog_now.replace('edit-stock-', '');
    notification_setting_editing.data.some(function (item) {
        if (item.symbol == stock_name) {
            item.edit.some(function (edit_o) {
                if (edit_o["name"] === value_name) {
                    $(".dropdown-item[key='" + edit_o["type"] + "']").click();
                    $("#" + NotificationDef.NAME).val(value_name);
                    Object.entries(edit_o["args"]).forEach(([key, value]) => {
                        $("#" + key).val(value);
                    });
              
                    return true;
                }
                return false;
            });

            return true;
        }
        return false;
    });
    
    
    //$(".dropdown-menu.edit[key='Hot Fuzz']").click();

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
    <span class="list-cell remove"><button type="button" class="close remove-stock"><span>&times;</span></button></span>
</li>
`;