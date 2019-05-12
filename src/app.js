var stock_data = {};
var config = {};

function triggerTrayCmd(event, param) {
  //document.getElementById('title').innerText = param.title;
  //document.getElementById('contents').innerText = param.contents;
}

const ipc = require('electron').ipcRenderer;
const zerorpc = require("zerorpc");
window.$ = window.jQuery = require("./jquery-1.11.1.min.js");

let client = new zerorpc.Client();

// ipc register
ipc.on('triggerTrayCmd', triggerTrayCmd);

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

  sendCmdToCore('get_realtime_stock', 'T', (error, res) => {
    if (error) {
      console.error(error);
    } else {
      console.log(res);
      console.log(res['close']);
    }
  });

});


$(document).ready(function () {

  ipc.send('getPort');

  stock_data['ListView'] = [
    {
      name: 'List1',
      data: [{
        symbol: 'AAPL',
        open: '10',
        high: '10',
        low: '10',
        close: '10',
        changeP: '0.46%',
        avg3mP: '10',
        volume: '100K',
        avg3mV: '200K',
        strikeP1Y: '20 - 30',
        link: 'https://project.zmcx16.moe'
      }, {
        symbol: 'GOOG',
        open: '10',
        high: '10',
        low: '10',
        close: '10',
        changeP: '0.46%',
        avg3mP: '10',
        volume: '100K',
        avg3mV: '200K',
        strikeP1Y: '20 - 30',
        link: 'https://project.zmcx16.moe'
      }]
    },
    {
      name: 'List2',
      data: [{
        symbol: 'T',
        open: '10',
        high: '10',
        low: '10',
        close: '10',
        changeP: '0.46%',
        avg3mP: '10',
        volume: '100K',
        avg3mV: '200K',
        strikeP1Y: '20 - 30',
        link: 'https://project.zmcx16.moe'
      }, {
        symbol: 'PSX',
        open: '10',
        high: '10',
        low: '10',
        close: '10',
        changeP: '0.46%',
        avg3mP: '10',
        volume: '100K',
        avg3mV: '200K',
        strikeP1Y: '20 - 30',
        link: 'https://project.zmcx16.moe'
      }]
    }
  ];

  $(document).click(function (event) {
    if (!$(event.target).is("#add-del-button, #add-popup, #search-bar, #add-symbol-input, #search-icon, .add-popup-text")) {
      $("#add-popup").hide();
    }
  });

  loadList();
  initStockSetting();
  dragList();

  $('#reorder-button').click(function () {
    if ($('#reorder-button').hasClass('reorder-running')) {
      $('#reorder-button').removeClass('reorder-running');
      $('#reorder-button').text('Reorder');
      $('.drag-tab').attr('style', 'display: none;');
      $('.check-tab').attr('style', 'display: inline-block;');
    }
    else {
      $('#reorder-button').addClass('reorder-running');
      $('#reorder-button').text('Reordering');
      $('.drag-tab').attr('style', 'display: inline-block;');
      $('.check-tab').attr('style', 'display: none;');
    }

    return;
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
function initStockSetting() {

  //unbind event
  $('#search-icon').unbind("click");
  $('input[name="stock-checkbox"]').unbind("change");
  $('#add-del-button').unbind("click");
  

  // reset status
  if ($('#reorder-button').hasClass('reorder-running')) {
    $('#reorder-button').click();
  }
  $('#add-del-button').text('Add');
  $("#add-popup").hide();
  $(":checkbox").attr("checked", false);

  // reset stock data
  $(".item").remove();
  var list_name = $("#group-list-select")[0].value;
  stock_data['ListView'].forEach(function (list_data, index, array) {
    if (list_name === list_data.name) {
      list_data.data.forEach(function (item, index, array) {
        var class_name = 'stock_' + item.symbol;
        if ($("." + class_name).length == 0) {
          let temp = stock_data_template.replace('{name}', item.symbol);
          temp = temp.replace('{symbol}', item.symbol);
          temp = temp.replace('{open}', item.open);
          temp = temp.replace('{high}', item.high);
          temp = temp.replace('{low}', item.low);
          temp = temp.replace('{close}', item.close);
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

  $('.drag-tab').attr('style', 'display: none;');
  $('.check-tab').attr('style', 'display: inline-block;');

  $('#search-icon').click(function (event) {

    sendCmdToCore('get_stock', 'T', (error, res) => {
      if (error || res == null) {
        console.error('error: ' + error);
        console.error('res: ' + res);
      } else {
        var list_index = $("#group-list-select")[0].selectedIndex;
        var stock = res;
        stock.link = link_template.replace('{symbol}', stock['symbol']);
        stock_data['ListView'][list_index].data.push(stock);
        initStockSetting();
      }
    });
  })

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

  $('#add-del-button').click(function (event) {

    if ($('#add-del-button')[0].innerText == 'Add') {
      var add_btn_loc = getPosition($('#add-del-button')[0]);
      var offset_x = $('#add-del-button')[0].offsetWidth / 2;
      var offset_y = $('#add-del-button')[0].offsetHeight;
      $('#add-popup').attr('style', `display: block; left: ${add_btn_loc.x + offset_x}; top: ${add_btn_loc.y + offset_y};`);
    }
    else if ($('#add-del-button')[0].innerText == 'Del') {
      var list_name = $("#group-list-select")[0].value;
      var list_index = $("#group-list-select")[0].selectedIndex;

      $.each($('input[name="stock-checkbox"]:checked'), function () {
        //$(this).closest('li').remove();
        var select_class_name = $(this).closest('li')[0].className;
        stock_data['ListView'][list_index].data.forEach(function (item, index, array) {
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
  stock_data['ListView'].forEach(function (item, index, array) {
    let temp = '<option value="{name}">{name}</option>'.split("{name}").join(item.name);
    $("#group-list-select").append(temp);
  });
}

function dragList() {
  var x, y, mx, my, lastItem;

  //drag-tab click event
  $(document).on("mousedown", ".drag-tab", function (mouse) {
    mx = mouse.clientX;
    my = mouse.clientY;
    x = mx - $(this).parent().offset().left;
    y = my - $(this).parent().offset().top;

    var width = $(this).parent().width();
    var height = $(this).parent().height();
    lastItem = $(".item:last").offset().top + ($(".item:last").height() / 2);

    $(this).parent().css({ "width": width, "height": height });
    $(this).parent().after("<li id='place-holder'></li>");
    $("#place-holder").css({ "height": $(this).height() });
    $(this).parent().addClass("draggable");
  });

  //drag event
  $(document).on("mousemove", function (mouse) {
    var holdPlace = $("#place-holder");
    if ($(".item").hasClass("draggable")) {
      mx = mouse.clientX;
      my = mouse.clientY;

      var item = $(".item");

      for (i = item.length - 1; i >= 0; i--) {
        if (!$(item[i]).hasClass("draggable")) {
          //if(true) {
          var dragTop = $(".draggable").offset().top;
          var noDrag = $(item[i]).offset().top + ($(item[i]).height() / 2);

          //console.log(lastItem);
          if (dragTop > lastItem) {
            //console.log($(item[i]).html());
            $("#place-holder").remove();
            $("#list").append(holdPlace);
          }
          if (dragTop < noDrag) {
            //console.log($(item[i]).html());
            $("#place-holder").remove();
            $(item[i]).before(holdPlace);
          }
        }
      }
      $(".draggable").css({ "top": my - y });//, "left" : mx - x });
    }
  });
  //mouse release event
  $(document).on("mouseup", function () {
    if ($(".item").hasClass("draggable")) {
      deselect();
    }
    var toPlace = $(".draggable");
    $(".draggable").remove();
    //console.log(toPlace);
    $(document).find("#place-holder").after(toPlace).remove();
    $(".item").attr("style", "").removeClass("draggable");
    //console.log($(".item"));
  });
  function deselect() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else
        if (window.getSelection().removeAllRanges) {  // Firefox
          window.getSelection().removeAllRanges();
        }
    } else
      if (document.selection) {  // IE?
        document.selection.empty();
      }
  }
}

/* common function */
function getPosition(element) {
  var x = 0;
  var y = 0;
  while (element) {
    x += element.offsetLeft - element.scrollLeft + element.clientLeft;
    y += element.offsetTop - element.scrollLeft + element.clientTop;
    element = element.offsetParent;
  }

  return { x: x, y: y };
}

/* common data */
const link_template = 'https://hk.finance.yahoo.com/quote/{symbol}';

/* template data */
const stock_data_template = `
<li class="item stock_{name}">
  <div class="check-tab">
    <input type="checkbox" name="stock-checkbox">
  </div>
  <div class="drag-tab">
    <div></div><div></div><div></div>
  </div>
  <span class="list-cell symbol">{symbol}</span>
  <span class="list-cell open">{open}</span>
  <span class="list-cell high">{high}</span>
  <span class="list-cell low">{low}</span>
  <span class="list-cell close">{close}</span>
  <span class="list-cell changeP">{changeP}</span>
  <span class="list-cell avg3mP">{avg3mP}</span>
  <span class="list-cell volume">{volume}</span>
  <span class="list-cell avg3mV">{avg3mV}</span>
  <span class="list-cell strikeP1Y">{strikeP1Y}</span>
  <span class="list-cell link"><a href="{link}">Link</a></span>
</li>
`;