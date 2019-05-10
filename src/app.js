var user_data = {};

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

ipc.on('saveListView_callback', (event, err) => {
  console.log(err);
});

ipc.on('loadListView_callback', (event, err, data) => {
  console.log(data);
  user_data = data;

  loadList();
  loadData();
  initSetting();
});

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
});


$(document).ready(function () {

  ipc.send('loadListView');
  ipc.send('getPort');
});

// zerorpc function
function sendCmdToCore(cmd, msg, callback){
  console.log('sendCmdToCore');
  client.invoke(cmd, msg, (error, res) => {
    callback(error, res);
  });
}

// main function
function initSetting() {

  stockItemInitSetting();
  addPopupWindow();
  setDelStock();
  dragList();
  reorder();

  $("#group-list-select").on('change', function () {
    console.log(this.value);
    $(".item").remove();
    loadData(this.value);
    stockItemInitSetting();
    setDelStock();
    resetReorder();
  });
}

function stockItemInitSetting(){
  $('.drag-tab').attr('style', 'display: none;');
  $('.check-tab').attr('style', 'display: inline-block;');
}

function setDelStock(){

  $('input[type=checkbox]').change(function () {
    var atLeastOneIsChecked = $('input[name="stock-checkbox"]:checked').length > 0;
    if (atLeastOneIsChecked){
      $('#add-del-button').text('Del');
    }
    else{
      $('#add-del-button').text('Add');
    }
  });

  $('#add-del-button').click(function (event) {
    if ($('#add-del-button')[0].innerText == 'Del') {
      $.each($('input[name="stock-checkbox"]:checked'), function () {
        $(this).closest('li').remove();
        ipc.send('saveListView', user_data['ListView']);
      });
      $('#add-del-button').text('Add');
    }
  });
}

function addPopupWindow(){

  $(document).click(function (event) {
    if (!$(event.target).is("#add-del-button, #add-popup, #search-bar, #add-symbol-input, #search-icon, .add-popup-text")) {
      $("#add-popup").hide();
    }
  });

  $('#add-del-button').click(function (event) {
    if($('#add-del-button')[0].innerText == 'Add'){
      var add_btn_loc = getPosition($('#add-del-button')[0]);
      var offset_x = $('#add-del-button')[0].offsetWidth / 2;
      var offset_y = $('#add-del-button')[0].offsetHeight;
      $('#add-popup').attr('style', `display: block; left: ${add_btn_loc.x + offset_x}; top: ${add_btn_loc.y + offset_y};`);
    }
  });
}

function resetReorder(){
  if ($('#reorder-button').hasClass('reorder-running')) {
    $('#reorder-button').click();
  }
}

function reorder(){

  $('#reorder-button').click(function () { 
    if ($('#reorder-button').hasClass('reorder-running')) {
      $('#reorder-button').removeClass('reorder-running');
      $('#reorder-button').text('Reorder');
      $('.drag-tab').attr('style','display: none;');
      $('.check-tab').attr('style', 'display: inline-block;');
    }
    else{
      $('#reorder-button').addClass('reorder-running');
      $('#reorder-button').text('Reordering');
      $('.drag-tab').attr('style', 'display: inline-block;');
      $('.check-tab').attr('style', 'display: none;');      
    }

  });
}

function loadList() {

  $("#group-list-select").empty();
  user_data['ListView'].forEach(function (item, index, array) {
    var temp = '<option value="{name}">{name}</option>'.split("{name}").join(item.name);
    $("#group-list-select").append(temp);
  });
}

function loadData(name=''){

  user_data['ListView'].forEach(function (item, index, array) {
    if ((name === '' && index == 0) || name === item.name){
      item.symbols.forEach(function (item, index, array) {
        temp = stock_data_template.replace('{symbol}', item);
        $("#list").append(temp);
      });
    }    
  });

  stockItemInitSetting();
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
/* template data */
var stock_data_template = `
<li class="item">
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
  <span class="list-cell change">{change}</span>
  <span class="list-cell avg-3m">{avg-3m}</span>
  <span class="list-cell volume">{volume}</span>
  <span class="list-cell avg-3m">{avg-3m}</span>
  <span class="list-cell strike-price-1y">{strike-price-1y}</span>
  <span class="list-cell link"><a href="{link}">Link</a></span>
</li>
`;