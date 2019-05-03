function triggerTrayCmd(event, param) {
  //document.getElementById('title').innerText = param.title;
  //document.getElementById('contents').innerText = param.contents;
}

const ipc = require('electron').ipcRenderer;
ipc.on('triggerTrayCmd', triggerTrayCmd);

window.$ = window.jQuery = require("./jquery-1.11.1.min.js");


$(document).ready(function () {

  initSetting();
  addPopupWindow();
  delStock();
  dragList();
  reorder();

});

function initSetting() {
  $('.drag-tab').attr('style', 'display: none;');
  $('.check-tab').attr('style', 'display: inline-block;');
}

function delStock(){

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