/* eslint-disable no-console */
const MIN_UPDATE_TIME = 10;

const electron = require('electron');
const ipc = electron.ipcRenderer;
const zerorpc = require("zerorpc");
var client = new zerorpc.Client();

// var
var stock_data = {};
var setting_data = {};
var input_dialog_now='';
var check_dialog_now = '';
var update_status = {};     //'key': bool
var enable_sync = false;

//interval
// eslint-disable-next-line no-unused-vars
var update_OHLCV_interval = null;


// ipc register
ipc.on('getPort_callback', (event, port) => {

  client.connect("tcp://127.0.0.1:" + port);
  
  //test core communication
  sendCmdToCore('test', 'HelloWorld', (error, res) => {
    if (error) {
      console.error(error);
    } else {
      console.log(res);
    }
  });

  //Test if can get data, if it is yes, set update interval.
  sendCmdToCore('get_realtime_stock', 'T', (error, res) => {
    if (error) {
      console.error(error);
      console.error(res);
    } else {
      update_OHLCV_interval = setInterval(updateOHLCV, 0);
    }
  });

});

ipc.on('doSaveStockData', () => {
  ipc.send("saveStockData", stock_data);
});

ipc.on('syncConfigData', (event, data) => {
  setting_data = data;
});


$(document).ready(function () {

  stock_data = ipc.sendSync('loadStockData');

  if (Object.keys(stock_data).length === 0){
    stock_data['ListView'] = [
      {
        name: 'List1',
        data: []
      },
      {
        name: 'List2',
        data: []
      }
    ];
  }

  setting_data = ipc.sendSync("loadConfigData");
  ipc.send('getPort');

  $(document).click(function (event) {
    if (!$(event.target).is("#add-del-button, #add-popup, #search-bar, #add-symbol-input, #search-icon, .add-popup-text")) {
      $("#add-popup").hide();
    }
    
    if (!$(event.target).is("#manage-button")) {
      $("#manage-popup").hide();
    }
  });

  loadList();
  initStockSetting();
  dragList();

  $('#notifications-button').click(function () {
    ipc.send('openNotificationWindow');
  });

  $('#setting-button').click(function () {
    ipc.send('openSettingWindow');
  });

  $('#reorder-button').click(function () {
    if ($('#reorder-button').hasClass('reorder-running')) {

      ResetReorderButton();

      let list_index = $("#group-list-select")[0].selectedIndex;
      let now_stocks = stock_data['ListView'][list_index].data;
      
      now_stocks.length = 0
      
      let item_list = $('.item');
      item_list.each(function (row_index) {
        let item = $(item_list[row_index]).children('.list-cell');
        let stock = {};
        item.each(function (col_index) {
          let col_name = $(item[col_index]).attr('class').split(' ').slice(-1)[0];
          let value = '';
          if (col_name==='link')
            value =  link_template.replace('{symbol}', stock['symbol']);
          else
            value = $(item[col_index])[0].textContent;

          stock[col_name] = value;
        }); 
        now_stocks.push(stock);
      });
      ipc.send("saveStockData", stock_data);
    }
    else {
      $('#reorder-button').addClass('reorder-running');
      $('#reorder-button').text('Reordering');
      $('.drag-tab').attr('style', 'display: inline-block;');
      $('.check-tab-wrap').attr('style', 'display: none;');
    }

    return;
  });

  $('#search-icon').click(function () {

    let symbols = $('#add-symbol-input')[0].value.split(",");
    $('#add-symbol-input')[0].value = "";
    symbols.forEach(function (symbol) {
      sendCmdToCore('get_stock', symbol.trim(), (error, res) => {
        if (error || res == null) {
          console.error(error);
          console.error(res);
          $('#alert-dialog-content')[0].innerText = "The stock(s) can't be found.";
          $('#alert-dialog-hidden-btn').click();
        } else {
          var list_index = $("#group-list-select")[0].selectedIndex;
          var stock = res;
          stock.link = link_template.replace('{symbol}', stock['symbol']);
          stock_data['ListView'][list_index].data.push(stock);
          ipc.send("saveStockData", stock_data);
          initStockSetting();
        }
      });
    })
  })

  $('#update-button').click(function () {
    update_status = {};
    $('#update-progress')[0].style.width = '0%';
    $('#update-progress')[0].innerHTML = '0%';
    updateOHLCV();
  });

  $('#manage-button').click(function () {
    var manage_btn_loc = getPosition($('#manage-button')[0]);
    var offset_x = $('#manage-button')[0].offsetWidth - parseInt($($('#manage-popup')[0]).css("width"));
    var offset_y = $('#manage-button')[0].offsetHeight;
    $('#manage-popup').attr('style', `display: block; left: ${manage_btn_loc.x + offset_x}; top: ${manage_btn_loc.y + offset_y};`);
  });

  $('#new-list-button').click(function () {
    input_dialog_now = 'new-list';
    $('#input-dialog-content')[0].innerText = "Create Stock List";
    $('#input-dialog-text')[0].value = "";
    $('#input-dialog-text')[0].placeholder = " List Name";
    $('#input-dialog-text-invalid').attr('style', 'display: none;');
    $('#input-dialog-hidden-btn').click();
  });

  $('#input-dialog-ok-btn').click(function () {
    if (input_dialog_now ==='new-list'){
      let list_name = $('#input-dialog-text')[0].value;
      let list_name_valid = true;
      stock_data['ListView'].every(function (list_data) {
        if (list_name === list_data.name || list_name==='') {
          list_name_valid = false;
          return false;
        }
        else
          return true;
      });

      if (list_name_valid){
        stock_data['ListView'].push({
          name: list_name,
          data: []
        });
        let temp = '<option value="{name}">{name}</option>'.split("{name}").join(list_name);
        $("#group-list-select").append(temp);
        $("#group-list-select").prop('selectedIndex', stock_data['ListView'].length-1);  
        $("#group-list-select").trigger("change");
        ipc.send("saveStockData", stock_data);
        $(".input-dialog-close").trigger("click");
      }
      else
      {
        $("#input-dialog-text-invalid").attr('style', 'display: block; color:red; padding-left:20px');
        $("#input-dialog-text-invalid")[0].innerText = "This List Name is invalid!";
      }
    }
  });

  $('#del-list-button').click(function () {

    if ($("#group-list-select")[0].length <= 1){
      $('#alert-dialog-content')[0].innerText = "You can't delete list if the list length <= 1.";
      $('#alert-dialog-hidden-btn').click();
    }
    else{
      var list_name = $("#group-list-select")[0].value;

      check_dialog_now = 'del-list';
      $('#check-dialog-content')[0].innerText = "Are you sure you want to delete '" + list_name + "'?";
      $('#check-dialog-hidden-btn').click();
    }

  });


  $('#check-dialog-ok-btn').click(function () {
    var list_name = $("#group-list-select")[0].value;
    var list_index = $("#group-list-select")[0].selectedIndex;
    if (check_dialog_now === 'del-list') {
      stock_data['ListView'].splice(list_index, 1);
      $("#group-list-select option[value='" + list_name + "']").remove();
      $("#group-list-select").trigger("change");
      ipc.send("saveStockData", stock_data);
      $(".check-dialog-close").trigger("click");
    }
  });

  $("#group-list-select").on('change', function () {
    initStockSetting();
  });
});

// zerorpc function
function sendCmdToCore(cmd, msg, callback){
  console.log('sendCmdToCore: ' + cmd);
  client.invoke(cmd, msg, (error, res) => {
    callback(error, res);
  });
}

// main function
function ResetReorderButton(){
  $('#reorder-button').removeClass('reorder-running');
  $('#reorder-button').text('Reorder');
  $('.drag-tab').attr('style', 'display: none;');
  $('.check-tab-wrap').attr('style', 'display: inline-block;');
}

function updateStocksColor(){

  let item_list = $('.item');
  item_list.each(function (row_index) {
    updateStockColor(item_list[row_index]);
  });
}

function updateStockColor(target) {

  let change = $(target).children('.list-cell.changeP');
  let sign = Math.sign(parseFloat($(change[0])[0].innerText));
  if (sign === 1) {
    $(change[0]).attr('style', 'color:green;');
  } else if (sign == -1) {
    $(change[0]).attr('style', 'color:red;');
  } else {
    $(change[0]).attr('style', 'color:black;');
  }
}

function updateOHLCV(){

  // check if keep sync data
  let time_now = new Date();
  let timestamp_now = Math.floor(time_now.getTime() / 1000);

  let day_start_int = parseInt(setting_data['data']['sync']['day_start']);
  let day_start = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), day_start_int / 100, day_start_int % 100);
  let timestamp_start = Math.floor(day_start.getTime() / 1000);

  let day_end_int = parseInt(setting_data['data']['sync']['day_end']);
  let day_end = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), day_end_int / 100, day_end_int % 100);
  let timestamp_end = Math.floor(day_end.getTime() / 1000);

  if (timestamp_start > timestamp_end){
    timestamp_start -= (60 * 60 * 24);
    day_start.setDate(day_start.getDate() -1);
  }

  if (timestamp_now >= timestamp_start && timestamp_now <= timestamp_end && setting_data['data']['sync']['week'][day_start.getDay()]) {
    enable_sync = true;
  }
  else {
    enable_sync = false;
  }

  // update UI
  let list_index = $("#group-list-select")[0].selectedIndex;
  let now_stocks = stock_data['ListView'][list_index].data;
  now_stocks.forEach(function (item) {
    sendCmdToCore('get_realtime_stock', item.symbol, (error, res) => {
      if (error) {
        console.error(error);
      } else {
        //console.log(res);
        updateOHLCV_UI(res);
      }
    });
  });

  clearInterval(update_OHLCV_interval);
  
  if (enable_sync){
    let update_time = setting_data['data']['sync']['interval'];
    if (update_time && update_time < MIN_UPDATE_TIME) {
      update_time = MIN_UPDATE_TIME;
    }
    update_OHLCV_interval = setInterval(updateOHLCV, update_time * 1000); 
  }

}

// eslint-disable-next-line no-unused-vars
function navToWebsite(link){
  ipc.send('navToWebsite', link);
}

function updateOHLCV_UI(stock){

  updateCol(stock['symbol'], 'openP', stock['openP']);
  updateCol(stock['symbol'], 'highP', stock['highP']);
  updateCol(stock['symbol'], 'lowP', stock['lowP']);
  updateCol(stock['symbol'], 'closeP', stock['closeP']);
  updateCol(stock['symbol'], 'volume', stock['volume']);
  updateCol(stock['symbol'], 'changeP', stock['changeP']);
  updateStockColor($('.item.stock_' + stock['symbol'])[0]);

  update_status[stock['symbol']] = true;
  let update_cnt = Object.keys(update_status).length;
  let total_num = $('.item').length;
  if (update_cnt < total_num){
    //console.log(update_cnt);
    $('#update-progress')[0].style.width = (update_cnt * 100 / total_num).toString() + '%';
    $('#update-progress')[0].innerHTML = (Math.round(update_cnt*100 / total_num)).toString() + '%';
  }else{
    $('#update-progress')[0].style.width = '100%';
    $('#update-progress')[0].innerHTML = '100%';
  }

  let led = "led-blue";
  if (enable_sync){
    led = "led-green";
  }

  let d = new Date();
  $('#last-update-time')[0].innerHTML = '<div class="' + led +'" id="last-update-time-led"></div>' + formatDate(d, "MM/dd") + "&nbsp;&nbsp;&nbsp;" + formatDate(d, "hh:mm:ss"); 
}

function updateCol(symbol, label, value){
  let target = $('.item.stock_' + symbol + ' .list-cell.' + label)[0];
  if (target){
    target.innerText = value;
  }
}

function initStockSetting() {

  //unbind event
  $('input[name="stock-checkbox"]').unbind("change");
  $('#add-del-button').unbind("click");

  // reset status
  ResetReorderButton();
  $('#add-del-button').text('Add');
  $("#add-popup").hide();
  $("#manage-popup").hide();
  $(":checkbox").attr("checked", false);

  // reset stock data
  $(".item").remove();
  var list_name = $("#group-list-select")[0].value;
  stock_data['ListView'].forEach(function (list_data) {
    if (list_name === list_data.name) {
      list_data.data.forEach(function (item) {
        var class_name = 'stock_' + item.symbol;
        if ($("." + class_name).length === 0) {
          let temp = stock_data_template.replace('{name}', item.symbol);
          temp = temp.replace('{checkbox}', item.symbol); temp = temp.replace('{checkbox}', item.symbol);
          temp = temp.replace('{symbol}', item.symbol);
          temp = temp.replace('{openP}', item.openP);
          temp = temp.replace('{highP}', item.highP);
          temp = temp.replace('{lowP}', item.lowP);
          temp = temp.replace('{closeP}', item.closeP);
          temp = temp.replace('{changeP}', item.changeP);
          temp = temp.replace('{avg3mP}', item.avg3mP);
          temp = temp.replace('{volume}', item.volume);
          temp = temp.replace('{avg3mV}', item.avg3mV);
          temp = temp.replace('{strikeP1Y}', item.strikeP1Y);
          temp = temp.replace('{link}', item.link);

          $("#list").append(temp);
        }
      });
    }
  });

  updateStocksColor();

  $('.drag-tab').attr('style', 'display: none;');
  $('.check-tab-wrap').attr('style', 'display: inline-block;');

  $('input[name="stock-checkbox"]').on('change', function () {
    var atLeastOneIsChecked = $('input[name="stock-checkbox"]:checked').length > 0;
    if (atLeastOneIsChecked) {
      $('#add-del-button').text('Del');
    }
    else {
      $('#add-del-button').text('Add');
    }

    return;
  });

  $('#add-del-button').click(function () {

    if ($('#add-del-button')[0].innerText == 'Add') {
      var add_btn_loc = getPosition($('#add-del-button')[0]);
      var offset_x = $('#add-del-button')[0].offsetWidth / 2;
      var offset_y = $('#add-del-button')[0].offsetHeight;
      $('#add-popup').attr('style', `display: block; left: ${add_btn_loc.x + offset_x}; top: ${add_btn_loc.y + offset_y};`);
    }
    else if ($('#add-del-button')[0].innerText == 'Del') {
      
      var list_index = $("#group-list-select")[0].selectedIndex;

      $.each($('input[name="stock-checkbox"]:checked'), function () {

        var select_class_name = $(this).closest('li')[0].className;
        stock_data['ListView'][list_index].data.forEach(function (item, index) {
          var class_name = 'stock_' + item.symbol;
          if (select_class_name.indexOf(class_name) != -1) {
            stock_data['ListView'][list_index].data.splice(index, 1);
          }
        });
      });
      $('#add-del-button').text('Add');
      initStockSetting();
    }
    
    return;
  });
}

function loadList() {

  $(".item").remove();
  $("#group-list-select").empty();
  stock_data['ListView'].forEach(function (item) {
    let temp = '<option value="{name}">{name}</option>'.split("{name}").join(item.name);
    $("#group-list-select").append(temp);
  });
}

/* common data */
const link_template = 'https://hk.finance.yahoo.com/quote/{symbol}';

/* template data */
const stock_data_template = `
<li class="item stock_{name}">
  <div class="drag-tab">
    <div></div><div></div><div></div>
  </div>
  <div class="check-tab-wrap">
    <div class="custom-control custom-checkbox check-tab">
      <input type="checkbox" class="custom-control-input" id="checkbox-{checkbox}" name="stock-checkbox">
      <label class="custom-control-label" for="checkbox-{checkbox}"></label>
    </div>
  </div>
  <span class="list-cell symbol">{symbol}</span>
  <span class="list-cell openP">{openP}</span>
  <span class="list-cell highP">{highP}</span>
  <span class="list-cell lowP">{lowP}</span>
  <span class="list-cell closeP">{closeP}</span>
  <span class="list-cell changeP">{changeP}</span>
  <span class="list-cell avg3mP">{avg3mP}</span>
  <span class="list-cell volume">{volume}</span>
  <span class="list-cell avg3mV">{avg3mV}</span>
  <span class="list-cell strikeP1Y">{strikeP1Y}</span>
  <span class="list-cell link"><a href="javascript:void(0)" onclick="navToWebsite('{link}')">Link</a></span>
</li>
`;