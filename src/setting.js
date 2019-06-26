/* eslint-disable no-console */

const electron = require('electron');
const ipc = electron.ipcRenderer;

// var
var setting_data = {};

$(document).ready(function () {

    setting_data = ipc.sendSync("loadConfigData");
    loadSetting();
});

// main function
function loadSetting() {

    let sync_setting = setting_data["data"]["sync"];
    $('#day_start')[0].value = sync_setting["day_start"];
    $('#day_end')[0].value = sync_setting["day_end"];
    $('#week_sun').attr("checked", sync_setting["week_sun"]);
    $('#week_mon').attr("checked", sync_setting["week_mon"]);
    $('#week_tue').attr("checked", sync_setting["week_tue"]);
    $('#week_wed').attr("checked", sync_setting["week_wed"]);
    $('#week_thu').attr("checked", sync_setting["week_thu"]);
    $('#week_fri').attr("checked", sync_setting["week_fri"]);
    $('#week_sat').attr("checked", sync_setting["week_sat"]);
    $('#interval')[0].value = sync_setting["interval"];
}

function SaveSetting() {

    setting_data["data"]["sync"]["day_start"] = $('#day_start')[0].value;
    setting_data["data"]["sync"]["day_end"] = $('#day_end')[0].value;
    setting_data["data"]["sync"]["week_sun"] = $("#week_sun").prop("checked");
    setting_data["data"]["sync"]["week_mon"] = $("#week_mon").prop("checked");
    setting_data["data"]["sync"]["week_tue"] = $("#week_tue").prop("checked");
    setting_data["data"]["sync"]["week_wed"] = $("#week_wed").prop("checked");
    setting_data["data"]["sync"]["week_thu"] = $("#week_thu").prop("checked");
    setting_data["data"]["sync"]["week_fri"] = $("#week_fri").prop("checked");
    setting_data["data"]["sync"]["week_sat"] = $("#week_sat").prop("checked");
    setting_data["data"]["sync"]["interval"] = $('#interval')[0].value;
    
    ipc.send("saveConfigData", setting_data);
}
