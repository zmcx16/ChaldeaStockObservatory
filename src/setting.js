/* eslint-disable no-console */

const electron = require('electron');
const ipc = electron.ipcRenderer;

// var
var setting_data = {};

$(document).ready(function () {

    setting_data = ipc.sendSync("loadConfigData");
    loadSetting();

    $('#ok-btn').click(function () {
        SaveSetting();
        window.close();
    });

    $('#cancel-btn').click(function () {
        window.close();
    });

});

// main function
function loadSetting() {

    let sync_setting = setting_data["data"]["sync"];
    $('#day_start')[0].value = sync_setting["day_start"];
    $('#day_end')[0].value = sync_setting["day_end"];
    $('#week_sun').attr("checked", sync_setting["week"][0]);
    $('#week_mon').attr("checked", sync_setting["week"][1]);
    $('#week_tue').attr("checked", sync_setting["week"][2]);
    $('#week_wed').attr("checked", sync_setting["week"][3]);
    $('#week_thu').attr("checked", sync_setting["week"][4]);
    $('#week_fri').attr("checked", sync_setting["week"][5]);
    $('#week_sat').attr("checked", sync_setting["week"][6]);
    $('#interval')[0].value = sync_setting["interval"];
}

function SaveSetting() {

    setting_data["data"]["sync"]["day_start"] = $('#day_start')[0].value;
    setting_data["data"]["sync"]["day_end"] = $('#day_end')[0].value;
    setting_data["data"]["sync"]["week"][0] = $("#week_sun").prop("checked");
    setting_data["data"]["sync"]["week"][1] = $("#week_mon").prop("checked");
    setting_data["data"]["sync"]["week"][2] = $("#week_tue").prop("checked");
    setting_data["data"]["sync"]["week"][3] = $("#week_wed").prop("checked");
    setting_data["data"]["sync"]["week"][4] = $("#week_thu").prop("checked");
    setting_data["data"]["sync"]["week"][5] = $("#week_fri").prop("checked");
    setting_data["data"]["sync"]["week"][6] = $("#week_sat").prop("checked");
    setting_data["data"]["sync"]["interval"] = $('#interval')[0].value;

    ipc.send("saveConfigData", setting_data);
}
