
const electron = require('electron');
const ipc = electron.ipcRenderer;

// var
var notification_data = {
    "data": [
        {
            "symbol": "INTC",
            "openP": "45.83",
            "highP": "46.42",
            "lowP": "45.55",
            "closeP": "46.19",
            "changeP": "1.95%",
            "volume": "15.38M",
            "enable": false,
            "edit": [
                {
                    "name": "C1",
                    "type": "st",
                    "value": {
                        "st_p": 10,
                        "st_v": 4
                    }
                }
            ]
        }
    ],
    "status": {
        "enable_sync": false
    }
}

// ipc register
ipc.on('syncNotificationData', (event, data) => {
    notification_data = data;
    updateOHLCV();
});

// OnStart
$(document).ready(function () {

    //notification_data = ipc.sendSync('getNotificationData');
    // get notification_data & enable_sync status from core

    if (Object.keys(notification_data).length === 0) {
        notification_data = {
            "data": [{}],
            "status": {
                "enable_sync": false
            }
        };
    }

    initStockSetting();
});

// main function
function setLedStatus(name, led) {
    $('.stock_' + name + ' .status-tab .led-green').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .led-blue').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .led-yellow').attr('style', 'display: none;');
    $('.stock_' + name + ' .status-tab .'+led).attr('style', 'display: block;');
}

function updateOHLCV() {

    /*
    enable_sync = needEnableSync(setting_data['data']['sync']);

    // update UI
    let list_index = $("#group-list-select")[0].selectedIndex;
    let now_stocks = stock_data['ListView'][list_index].data;
    now_stocks.forEach(function (item) {
        sendCmdToCore('get_realtime_stock', item.symbol, (error, res) => {
            if (error) {
                console.error(error);
            } else {
                //console.log(res);
                updateOHLCV_UI(res, enable_sync, update_status);
            }
        });
    });

    clearInterval(update_OHLCV_interval);

    if (enable_sync) {
        let update_time = setting_data['data']['sync']['interval'];
        if (update_time && update_time < MIN_UPDATE_TIME) {
            update_time = MIN_UPDATE_TIME;
        }
        update_OHLCV_interval = setInterval(updateOHLCV, update_time * 1000);
    }
    */
}

function initStockSetting() {

    $(".item").remove();
    notification_data.data.forEach(function (item) {
        var class_name = 'stock_' + item.symbol;
        if ($("." + class_name).length === 0) {
            let temp = notification_container_template.replace('{name}', item.symbol);
            temp = temp.replace('{symbol}', item.symbol);
            temp = temp.replace('{openP}', item.openP);
            temp = temp.replace('{highP}', item.highP);
            temp = temp.replace('{lowP}', item.lowP);
            temp = temp.replace('{closeP}', item.closeP);
            temp = temp.replace('{changeP}', item.changeP);
            temp = temp.replace('{volume}', item.volume);
            $("#list").append(temp);
            if (item.enable){
                setLedStatus(item.symbol, "led-green");
            }
            else{
                setLedStatus(item.symbol, "led-blue");
            }

        }
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
        <button type="button" class="btn btn-sm btn-toggle" data-toggle="button" aria-pressed="false" autocomplete="off">
            <div class="handle"></div>
        </button>
    </div>
    <span class="list-cell remove"><button type="button" class="close remove"><span>&times;</span></button></span>
</li>
`;